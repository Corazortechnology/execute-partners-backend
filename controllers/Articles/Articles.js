const mongoose = require("mongoose");
const { Article, Community } = require("../../models/Articles/Articles");
const User = require("../../models/Auth/User");
const azureBlobService = require("../../services/azureBlobService");
const axios = require("axios");
const FormData = require("form-data");

const VALID_CATEGORIES = [
  "Business Transformation",
  "Technology Services",
  "Regulatory Compliance & Risk",
  "Treasury Implementations",
  "People",
  "Digital",
];

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple hyphens with single hyphen
}

// Get all articles (with pagination and filtering)
exports.getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, author, category } = req.query;
    const query = { isPublished: true };

    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (category) query.category = category;

    const articles = await Article.find(query)
      .populate("author", "username profile")
      .sort("-publishedAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Article.countDocuments(query);

    res.status(200).json({
      message: "Articles retrieved successfully",
      data: articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving articles", error });
  }
};

// Get specific article by ID
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("author", "username profile")
      .populate("comments.user", "username profile")
      .populate("comments.replies.user", "username profile");

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Increment views
    article.views += 1;
    console.log("Before save:", article.views);
    await article.save();
    console.log("After save:", article.views);

    res.status(200).json({
      message: "Article retrieved successfully",
      data: article,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving article", error });
  }
};

// Create new article
exports.createArticle = async (req, res) => {
  try {
    const { title, content, tags, meta, category, userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required in request body" });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid article category",
        validCategories: VALID_CATEGORIES,
      });
    }

    let parsedContent = [];
    let parsedTags = [];
    let parsedMeta = {};

    try {
      parsedContent = JSON.parse(content);
      parsedTags = JSON.parse(tags);
      parsedMeta = JSON.parse(meta);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid JSON in content, tags, or meta" });
    }

    const contentText = parsedContent
      .map((block) => block.text || "")
      .join(" ");
    const combinedText = [
      title,
      contentText,
      parsedMeta?.description || "",
      parsedTags.join(" "),
    ].join(" ");

    // Prepare text moderation
    const textForm = new FormData();
    textForm.append("text", combinedText);
    textForm.append("article", "true");

    // Prepare image moderation
    let imageModerationResult = null;
    const imageForm = new FormData();
    if (req.file) {
      // imageForm.append("image_file", req.file.buffer, req.file.originalname);
      const imageStreamResponse = await axios({
        method: "get",
        url: req.file.path,
        responseType: "stream",
      });

      imageForm.append("image_file", imageStreamResponse.data, {
        filename: req.file.originalname || "image.jpg",
        contentType: req.file.mimetype || "image/jpeg",
      });

      imageForm.append("article", "true");
    }

    let textModerationResult;

    try {
      [textModerationResult, imageModerationResult] = await Promise.all([
        axios.post(
          "https://execute-partners-backend-1-cvql.onrender.com/filtercomment",
          textForm,
          {
            headers: textForm.getHeaders(),
          }
        ),
        req.file
          ? axios.post(
              "https://execute-partners-backend-1-cvql.onrender.com/filtercomment",
              imageForm,
              {
                headers: imageForm.getHeaders(),
              }
            )
          : [null],
      ]);
    } catch (modError) {
      console.error(
        "Moderation API Error:",
        modError?.response?.data || modError.message
      );
      return res.status(500).json({
        message: "Moderation API failed",
        details: modError?.response?.data || {},
      });
    }

    const textSafe = textModerationResult?.data?.safe ?? true;
    const imageSafe = imageModerationResult?.data?.safe ?? true;

    if (!textSafe) {
      return res.status(403).json({
        message: "Article contains inappropriate or unsafe text content",
        details: textModerationResult.data,
      });
    }

    // Upload image to Azure
    // let coverImage = null;
    // if (req.file) {
    //   coverImage = await azureBlobService.uploadToAzure(req.file.buffer, req.file.originalname);
    // }

    // Assuming the blurred image URL and original image URL are stored in the database
    let coverImage = null;
    let originalImage = null;

    if (req.file) {
      // If the image is safe, upload the original image to Cloudinary
      if (imageSafe) {
        coverImage = req.file.path; // Safe image, store it as cover image
        originalImage = req.file.path; // Store the original image URL
      } else {
        // If the image is unsafe, save the blurred version from moderation response
        const moderationData = imageModerationResult?.data || {};
        coverImage = moderationData.blurred_image_base64 || null; // Store the blurred image as coverImage
        originalImage = req.file.path; // Still store the original image URL for future access by the user
      }
    }

    const structuredContent = parsedContent.map((block) => ({
      ...block,
      order: parseInt(block.order),
    }));

    const newArticle = new Article({
      title,
      category,
      author: userId,
      content: structuredContent,
      tags: parsedTags,
      coverImage,
      originalImage,
      isPublished: true,
      meta: parsedMeta,
      slug: generateSlug(title),
      publishedAt: Date.now(),
    });

    await newArticle.save();

    await User.findByIdAndUpdate(userId, {
      $push: { articles: newArticle._id },
    });

    // 🔥 If image is unsafe, return blurred version and message
    if (!imageSafe) {
      const moderationData = imageModerationResult?.data || {};

      return res.status(201).json({
        message: "Image rejected due to policy violation.",
        alert_message: moderationData.alert_message || "Image content flagged",
        blurred_image_base64: moderationData.blurred_image_base64 || null,
        data: newArticle,
      });
    }

    // ✅ Normal success response
    return res.status(201).json({
      message: "Article created successfully",
      data: newArticle,
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({
      message: "Error creating article",
      error: {
        message: error.message,
        stack: error.stack,
        ...error.errors,
        name: error.name,
      },
    });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check ownership
    if (article.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, content, tags, meta, category } = req.body;

    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid article category",
        validCategories: VALID_CATEGORIES,
      });
    }

    // Handle file upload
    // if (req.file) {
    //   article.coverImage = await azureBlobService.uploadToAzure(
    //     req.file.buffer,
    //     req.file.originalname
    //   );
    // }

    if (req.file && req.file.path) {
      article.coverImage = req.file.path; // Multer + Cloudinary sets this to Cloudinary URL
    }

    // Update fields
    article.title = title || article.title;
    article.content = content ? JSON.parse(content) : article.content;
    article.tags = tags ? JSON.parse(tags) : article.tags;
    article.meta = meta ? JSON.parse(meta) : article.meta;
    if (category) article.category = category;
    article.updatedAt = Date.now();

    await article.save();

    res.status(200).json({
      message: "Article updated successfully",
      data: article,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({
      message: "Error updating article",
      error: error.message,
      stack: error.stack,
    });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check ownership
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await article.remove();

    // Remove from user's articles
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { articles: article._id },
    });

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting article", error });
  }
};

// Add like to article
exports.likeArticle = async (req, res) => {
  try {
    const userId = req.user._id;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const alreadyLiked = article.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike the article
      article.likes.pull(userId);
      article.claps = Math.max(0, article.claps - 1); // Prevent claps < 0

      // Remove from user's liked articles (optional)
      await User.findByIdAndUpdate(userId, {
        $pull: { likedArticles: article._id },
      });

      await article.save();
      return res.status(200).json({
        message: "Article unliked",
        claps: article.claps,
      });

    } else {
      // Like the article
      article.likes.push(userId);
      article.claps += 1;

      await User.findByIdAndUpdate(userId, {
        $addToSet: { likedArticles: article._id },
      });

      await article.save();
      return res.status(200).json({
        message: "Article liked",
        claps: article.claps,
      });
    }

  } catch (error) {
    console.error("Error in likeArticle:", error);
    res.status(500).json({ message: "Error processing like", error });
  }
};


// Add comment to article
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body; // 1. Call the filtercomment API to check if the comment is safe
    const form = new FormData();
    form.append("text", content); // this is the field expected by the moderation API

    // ✅ 2. Call moderation API with multipart headers
    let moderationResponse;
    try {
      moderationResponse = await axios.post(
        "https://execute-partners-backend-1-cvql.onrender.com/filtercomment",
        form,
        {
          headers: form.getHeaders(),
        }
      );
    } catch (modError) {
      if (modError.response && modError.response.status === 400) {
        const raw = modError.response.data;

        return res.status(403).json({
          message:
            raw?.message ||
            "Your content is toxic or inappropriate. We can't add your comment.",
          details: raw || {},
        });
      }

      console.error("Moderation API Error:", modError);
      return res.status(500).json({
        message: "Moderation check failed due to a server error.",
        error: modError.message || modError.toString(),
      });
    }

    const { safe, identity_hate, toxic, insult } = moderationResponse.data;

    // 2. If not safe, reject the comment
    if (!safe) {
      return res.status(403).json({
        message: "Comment contains abusive or inappropriate content.",
        details: {
          identity_hate,
          toxic,
          insult,
        },
      });
    }

    const comment = {
      user: req.user.id,
      content,
      likes: [],
    };

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment } },
      { new: true }
    ).populate("comments.user", "username profile");

    res.status(201).json({
      message: "Comment added successfully",
      data: article.comments[article.comments.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    // 1. Validate content
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const form = new FormData();
    form.append("text", content); // this is the field expected by the moderation API

    // ✅ 2. Call moderation API with multipart headers
    let moderationResponse;
    try {
      moderationResponse = await axios.post(
        "https://mridul2003-aifiltercontent.hf.space/filtercomment",
        form,
        {
          headers: form.getHeaders(),
        }
      );
    } catch (modError) {
      if (modError.response && modError.response.status === 400) {
        const raw = modError.response.data;

        return res.status(403).json({
          message:
            raw?.message ||
            "Your content is toxic or inappropriate. We can't add your comment.",
          details: raw || {},
        });
      }

      console.error("Moderation API Error:", modError);
      return res.status(500).json({
        message: "Moderation check failed due to a server error.",
        error: modError.message || modError.toString(),
      });
    }

    const { safe, identity_hate, toxic, insult } = moderationResponse.data;

    if (!safe) {
      return res.status(403).json({
        message: "Updated comment contains abusive or inappropriate content.",
        details: { identity_hate, toxic, insult },
      });
    }

    // 3. Find the article and the target comment
    const article = await Article.findOne({
      _id: req.params.id,
      "comments._id": req.params.commentId,
    });

    if (!article) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = article.comments.id(req.params.commentId);

    // 4. Authorization checks
    if (!comment.user) {
      return res.status(400).json({ message: "Comment user is missing" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (comment.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this comment" });
    }

    // 5. Update comment
    comment.content = content;
    comment.updatedAt = Date.now();

    article.comments.forEach((comment) => {
      if (Array.isArray(comment.replies)) {
        comment.replies = comment.replies.filter((reply) => reply.user);
      }
    });

    await article.save();

    res.status(200).json({
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Error updating comment",
      error: error.message || error.toString(),
    });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    const comment = article.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership or admin
    if (!comment.user) {
      return res.status(400).json({ message: "Comment user is missing" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (
      comment.user.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    article.comments.pull(req.params.commentId);
    await article.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Error deleting comment",
      error: error.message || error.toString(),
    });
  }
};

// Add reply to comment
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;

    // 1. Validate content
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Reply content is required" });
    }

    // 2. Run moderation check
    const form = new FormData();
    form.append("text", content); // this is the field expected by the moderation API

    // ✅ 2. Call moderation API with multipart headers
    let moderationResponse;
    try {
      moderationResponse = await axios.post(
        "https://mridul2003-aifiltercontent.hf.space/filtercomment",
        form,
        {
          headers: form.getHeaders(),
        }
      );
    } catch (modError) {
      if (modError.response && modError.response.status === 400) {
        const raw = modError.response.data;

        return res.status(403).json({
          message:
            raw?.message ||
            "Your content is toxic or inappropriate. We can't add your comment.",
          details: raw || {},
        });
      }

      console.error("Moderation API Error:", modError);
      return res.status(500).json({
        message: "Moderation check failed due to a server error.",
        error: modError.message || modError.toString(),
      });
    }

    const { safe, identity_hate, toxic, insult } = moderationResponse.data;

    if (!safe) {
      return res.status(403).json({
        message: "Reply contains abusive or inappropriate content.",
        details: { identity_hate, toxic, insult },
      });
    }

    // 3. Construct the reply
    const reply = {
      user: req.user._id,
      content,
      likes: [],
    };

    // 4. Save reply to the article
    const article = await Article.findOneAndUpdate(
      {
        _id: req.params.id,
        "comments._id": req.params.commentId,
      },
      { $push: { "comments.$.replies": reply } },
      { new: true }
    ).populate("comments.replies.user", "username profile");

    if (!article) {
      return res.status(404).json({ message: "Article or comment not found" });
    }

    const updatedComment = article.comments.id(req.params.commentId);
    const lastReply = updatedComment?.replies?.slice(-1)[0];

    res.status(201).json({
      message: "Reply added successfully",
      data: lastReply,
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    res
      .status(500)
      .json({ message: "Error adding reply", error: error.message });
  }
};

// To join the community
exports.joinGlobalCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    let community = await Community.findOne();

    if (!community) {
      community = new Community({ name: "Execute Community" });
    }

    if (community.joinedUsers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already joined the community" });
    }

    community.joinedUsers.push(userId);
    await community.save();

    res.status(200).json({ message: "Joined Community Successfully" });
  } catch (error) {
    console.error("Error joining community: ", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// To get the total joined user for community
exports.getGlobalCommunityJoinCount = async (req, res) => {
  try {
    const community = await Community.findOne().select("joinedUsers");
    const count = community?.joinedUsers?.length || 0;
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching community count: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// To check if user has already joined the community
exports.checkGlobalCommunityJoinStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const community = await Community.findOne().select("joinedUsers");

    if (!community) {
      return res.status(200).json({ joined: false });
    }

    const hasJoined = community.joinedUsers.includes(userId);

    res.status(200).json({ joined: hasJoined });
  } catch (error) {
    console.error("Error checking join status: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

