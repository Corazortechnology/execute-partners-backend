const mongoose = require("mongoose");

// Schema for individual cards
const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String},
  icon: { type: String }, // URL for the icon
});

// Schema for the entire "Why Execute?" component
const whyExecuteSchema = new mongoose.Schema({
  heading: { type: String, required: true, default: "Why execute?" },
  subheading: { type: String, default: "" },
  cards: [cardSchema], // Array of cards
});

const WhyExecute = mongoose.model("WhyExecute", whyExecuteSchema);
module.exports = WhyExecute;
