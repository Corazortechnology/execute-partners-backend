const mongoose = require("mongoose");

// Schema for individual contact us cards
const practiceCardSchema = new mongoose.Schema({
  heading: { type: String, required: true }, // Card heading (e.g., "Experts on Contract")
  description: { type: String, required: true }, // Card content/description
});

// Schema for the entire contact us component
const subheadding = new mongoose.Schema({
    infoEmail: { type: String, default: "info@example.com" },
    hrEmail: { type: String, default: "hr@example.com" },
    officeAddress: { type: String, default: "5th Floor, Technopolis Knowledge Park, Mahakali Caves Road, Chakala, Andheri - East, Mumbai - 400093." },
    description: { type: String, default: "We are always happy to hear about your vision and goals." }
});
// Schema for the entire contact us component
const contactUsSchema = new mongoose.Schema({
  subheading: subheadding,
  cards: [practiceCardSchema], // Array of contact us cards
});

const ContactUs = mongoose.model("ContactUs", contactUsSchema);
module.exports = ContactUs;
