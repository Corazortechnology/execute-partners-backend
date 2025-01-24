const mongoose = require("mongoose");

// Schema for individual career cards
const careerCardSchema = new mongoose.Schema({
  heading: { type: String, required: true }, // Card heading (e.g., "Experts on Contract")
  description: { type: String, required: true }, // Card content/description
});

// Schema for the entire Careers component
const careersSchema = new mongoose.Schema({
  subheading: {
    type: String,
    required: true,
    default:
      "We are seeking skilled professionals for consultancy assignments. Join our versatile community that thrives on delivering exceptional experiences",
  },
  cards: [careerCardSchema], // Array of career cards
});

const Careers = mongoose.model("Careers", careersSchema);

module.exports = Careers;
