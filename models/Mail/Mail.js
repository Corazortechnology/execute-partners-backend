// Email Model
const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  text: { type: String },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Email", EmailSchema);
