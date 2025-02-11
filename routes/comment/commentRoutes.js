const express = require("express");
const { addCommentOrReply, getCommentsWithReplies, deleteComment } = require("../../controllers/comments/commentController");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();

// 📌 **Add a top-level comment to a card**
router.post("/card/:cardId/comment", authMiddleware,addCommentOrReply);

// 📌 **Add a reply to a specific comment (supports nested replies)**
router.post("/comment/:parentCommentId/reply", authMiddleware, addCommentOrReply);

// 📌 **Get all comments (with nested replies) for a specific card**
router.get("/card/:cardId/comments", getCommentsWithReplies);

// 📌 **Delete a specific comment or reply**
router.delete("/comment/:commentId", deleteComment);

module.exports = router;
