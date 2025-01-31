const mongoose = require("mongoose");

const yellowCardSchema = new mongoose.Schema({
  heading: { type: String, required: true }, // Card title
  description: { type: String, required: true }, // Card content
});

const YellowCard = mongoose.model("YellowCardSection", yellowCardSchema);

module.exports = YellowCard;
