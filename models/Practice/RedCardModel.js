const mongoose = require("mongoose");

const redCardSchema = new mongoose.Schema({
  cards: [
    {
      heading: { type: String, required: true }, // Card title
      description: { type: String, required: true }, // Card description
    },
  ],
  quote: { type: String, required: true }, // Quote text
  author: { type: String, required: true }, // Author name
});

const RedCardSection = mongoose.model("RedCardSection", redCardSchema);

module.exports = RedCardSection;
