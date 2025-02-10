const mongoose = require("mongoose");

// Schema for individual insight cards
const insightCardSchema = new mongoose.Schema({
  heading: { type: String, required: true }, // Insight heading (e.g., "Experts on Contract")
  headingLinks:[{text:{type: String},url:{type: String}}],
  description: { type: String}, // Insight content/description
  descriptionLinks:[{text:{type: String},url:{type: String}}],
  dateTime: { type: String, required: true },
  readDuration: { type: String },
  imageUrl: { type: String },
  category: { type: String },
  references:[{title:{type: String},url:{type: String}}],
  socialLinks:[{text:{type: String},url:{type: String}}],
  content: [{
    type: { type: String, enum: ["paragraph", "list"], default:"paragraph" }, // Section type
    heading: { type: String }, // Insight heading (e.g., "Experts on Contract")
    headingLinks: [
      {
        text: { type: String, required: true }, // Link text in the heading
        url: { type: String, required: true }, // URL in the heading
      },
    ],
    description: { type: String }, // Insight content/description
    descriptionLinks: [
      {
        text: { type: String, required: true }, // Link text in the paragraph
        url: { type: String, required: true }, // URL in the paragraph
      },
    ],
    listItems: [{
      heading: { type: String }, // Insight heading (e.g., "Experts on Contract")
      headingLinks: [
        {
          text: { type: String, required: true }, // Link text in the heading
          url: { type: String, required: true }, // URL in the heading
        },
      ],
      description: { type: String}, // Insight content/description
      descriptionLinks: [
        {
          text: { type: String, required: true }, // Link text in the paragraph
          url: { type: String, required: true }, // URL in the paragraph
        },
      ],
      items:[{type: String}],
      itemLinks: [
        {
          text: { type: String, required: true }, // Link text
          url: { type: String, required: true }, // Link URL
        },
      ], // Array of links for text
    }], // List of items for bullet points
    
    imageUrl: { type: String },
    videoUrl: { type: String }
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
