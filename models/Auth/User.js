const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      maxlength: 500,
    },
    profile: {
      type: String, // Will store a URL or path to the profile photo
      required: false,
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
