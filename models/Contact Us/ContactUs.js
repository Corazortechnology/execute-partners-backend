const mongoose = require("mongoose");

// Schema for individual contact us cards
const practiceCardSchema = new mongoose.Schema({
  heading: { type: String, required: true }, // Card heading (e.g., "Experts on Contract")
  description: { type: String, required: true }, // Card content/description
});

// Schema for the entire contact us component
const contactUsSchema = new mongoose.Schema({
  subheading: {
    type: String,
    default: "Contact us at example@gmail.com",
  },
  cards: [practiceCardSchema], // Array of contact us cards
});

const ContactUs = mongoose.model("ContactUs", contactUsSchema);
module.exports = ContactUs;
