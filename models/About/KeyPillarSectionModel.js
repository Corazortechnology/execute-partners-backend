const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const keyPillarsSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  cards: [cardSchema],
});

module.exports = mongoose.model("KeyPillars", keyPillarsSchema);
