const mongoose = require("mongoose");

const technologySectionSchema = new mongoose.Schema({
  subheading: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String, 
    required: true,
  },
});

const TechnologySection = mongoose.model(
  "TechnologySection",
  technologySectionSchema
);

module.exports = TechnologySection;
