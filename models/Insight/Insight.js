const mongoose = require("mongoose");

// Schema for individual insight cards
const insightCardSchema = new mongoose.Schema({
  heading: { type: String, required: true }, // Insight heading (e.g., "Experts on Contract")
  description: { type: String, required: true }, // Insight content/description
  dateTime: { type: String, required: true },
  readDuration: { type: String },
  imageUrl: { type: String },
  category: { type: String },
  content: [{
    heading: { type: String, required: true }, // Insight heading (e.g., "Experts on Contract")
    description: { type: String, required: true }, // Insight content/description
    imageUrl: { type: String },
    videoUrl : {type: String}
  }]
});

// Schema for the entire Insights component
const InsightsSchema = new mongoose.Schema({
  subheading: {
    type: String,
    required: true,
    default:
      "Gain valuable insights from transformation, technology, digital, people, regulatory, and customer experience",
  },
  cards: [insightCardSchema], // Array of career cards
});

const Insight = mongoose.model("Insight", InsightsSchema);

module.exports = Insight;
