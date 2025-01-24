const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  heading: { type: String, required: true }, 
  description: { type: String, required: true }, 
});

// Use "greenCards" as the collection name
const GreenCard = mongoose.model("GreenCard", cardSchema);

module.exports = GreenCard;
