const mongoose = require("mongoose");

// Comment Schema (now with user reference)
const commentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  replies: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    content: String,
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }]
  }],
}, { timestamps: true });

// Article Content Schema
const contentBlockSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["paragraph", "heading", "image", "code", "quote", "list"], 
    default: "paragraph"
  },
  text: String,
  items: [String],
  language: String,
  imageUrl: String,
  caption: String,
  links: [{
    text: String,
    url: String
  }],
  order: { type: Number, required: true }
});

// Article Schema (updated with associations)
const articleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  category: {
    type: String,
    enum: [
      "Business Transformation",
      "Technology Services",
      "Regulatory Compliance & Risk",
      "Treasury Implementations",
      "People",
      "Digital"
    ],
    required: true,
    default: "Business Transformation" // You can change default if needed
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  content: [contentBlockSchema],
  tags: [String],
  coverImage: String,
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  comments: [commentSchema],
  claps: { 
    type: Number, 
    default: 0 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  meta: {
    description: String,
    keywords: [String]
  },
  isPublished: { 
    type: Boolean, 
    default: false 
  },
  publishedAt: Date
}, { timestamps: true });

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;