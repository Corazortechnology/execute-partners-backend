const mongoose = require("mongoose");

// Recursive schema for comments and replies
const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Ensure correct reference
    text: { type: String, required: true },         // Content of comment/reply
  dateTime: { type: Date, default: Date.now },    // Timestamp
  likes: { type: Number, default: 0 },            // Likes on comment/reply
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],  // Nested replies
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // Parent comment reference
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Insight.cards', default: null },  // Card reference (only for top-level comments)
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
