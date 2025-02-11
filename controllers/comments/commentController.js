const User = require("../../models/Auth/User");
const Insight = require("../../models/Insight/Insight");
const Comment = require("../../models/comment/comment");

// Add a comment or reply
exports.addCommentOrReply = async (req, res) => {
  const { cardId, parentCommentId } = req.params;

  const { text } = req.body;
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  try {
    const newComment = new Comment({
      user:user._id,
      text,
      cardId: cardId || null,
      parentComment: parentCommentId || null,
    });
    await newComment.save();

    // If it's a reply, add it to the parent comment's replies array
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: newComment._id },
      });
    } else if (cardId) {
      // If it's a top-level comment, link it to the card
      await Insight.updateOne(
        { "cards._id": cardId },
        { $push: { "cards.$.comments": newComment._id } }
      );
    }

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all comments with nested replies for a specific card
const deepPopulateReplies = async (comment, depth = 5) => {
    if (depth === 0) return comment;
  
    return await Comment.populate(comment, {
      path: "replies",
      populate: [
        { path: "user", select: "name email username" },
        {
          path: "replies",
          populate: [
            { path: "user", select: "name email username" },
            { path: "replies", populate: { path: "user", select: "name email username" } },
          ],
        },
      ],
    }).then(async (populatedComment) => {
      if (!populatedComment.replies.length) return populatedComment;
      populatedComment.replies = await Promise.all(
        populatedComment.replies.map((reply) => deepPopulateReplies(reply, depth - 1))
      );
      return populatedComment;
    });
  };
  
  // 📌 **Controller Function to Get Comments with Nested Replies**
  exports.getCommentsWithReplies = async (req, res) => {
    const { cardId } = req.params;
    try {
      // Fetch top-level comments
      const comments = await Comment.find({ cardId, parentComment: null })
        .populate({ path: "user", select: "name email username" });
  
      // Deep populate replies recursively
      const fullyPopulatedComments = await Promise.all(
        comments.map((comment) => deepPopulateReplies(comment))
      );
  
      res.status(200).json({ success: true, comments: fullyPopulatedComments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Recursive function to delete nested replies
const deleteCommentAndReplies = async (commentId) => {
    const comment = await Comment.findById(commentId);
    if (comment.replies.length > 0) {
      for (let replyId of comment.replies) {
        await deleteCommentAndReplies(replyId); // Recursively delete replies
      }
    }
    await Comment.findByIdAndDelete(commentId);
  };
  
  // Delete a comment or reply
  exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;
  
    try {
      await deleteCommentAndReplies(commentId);
      res.status(200).json({ success: true, message: "Comment and its replies deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  