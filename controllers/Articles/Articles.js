const mongoose = require("mongoose");
const Article = require("../../models/Articles/Articles");
const User = require("../../models/Auth/User");
const azureBlobService = require("../../services/azureBlobService");
const axios = require("axios");

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
    await article.save();

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
    const { title, content, tags, meta, category, userId } = req.body; // include userId from body

    // Validate userId presence
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required in request body" });
    }

    // Handle file uploads
    let coverImage;
    if (req.file) {
      coverImage = await azureBlobService.uploadToAzure(
        req.file.buffer,
        req.file.originalname
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid article category",
        validCategories: VALID_CATEGORIES,
      });
    }

    // Parse content blocks
    const parsedContent = JSON.parse(content).map((block) => ({
      ...block,
      order: parseInt(block.order),
    }));

    const newArticle = new Article({
      title,
      category,
      author: userId, // use userId from body here
      content: parsedContent,
      tags: JSON.parse(tags),
      coverImage,
      meta: JSON.parse(meta),
      slug: generateSlug(title), // Make sure this function exists
      publishedAt: Date.now(),
    });

    await newArticle.save();

    // Add article to user's articles
    await User.findByIdAndUpdate(userId, {
      $push: { articles: newArticle._id },
    });

    res.status(201).json({
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
    if (req.file) {
      article.coverImage = await azureBlobService.uploadToAzure(
        req.file.buffer,
        req.file.originalname
      );
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
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likes: req.user._id },
        $inc: { claps: 1 },
      },
      { new: true }
    );

    // Add to user's liked articles
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { likedArticles: article._id },
    });

    res.status(200).json({
      message: "Article liked successfully",
      data: article,
    });
  } catch (error) {
    res.status(500).json({ message: "Error liking article", error });
  }
};

// Add comment to article
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body; // 1. Call the filtercomment API to check if the comment is safe
    const moderationResponse = await axios.post(
      "https://mridul2003-aifiltercontent.hf.space/filtercomment",
      { text: content },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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

    // 2. Check content moderation
    const moderationResponse = await axios.post(
      "https://mridul2003-aifiltercontent.hf.space/filtercomment",
      { text: content },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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
    const moderationResponse = await axios.post(
      "https://mridul2003-aifiltercontent.hf.space/filtercomment",
      { text: content },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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
