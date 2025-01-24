const mongoose = require('mongoose');

const practiceCardSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Card title (e.g., "Business Transformation")
  description: { type: String },          // Optional description for the card
  imageUrl: { type: String, required: true } // URL to Azure Blob Storage for the card image
});

module.exports = mongoose.model('PracticeCard', practiceCardSchema);
