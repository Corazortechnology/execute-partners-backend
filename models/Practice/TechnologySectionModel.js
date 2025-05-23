const mongoose = require("mongoose");

const technologySectionSchema = new mongoose.Schema({
  subheading: {
    type: String,
  },
  content: {
    title: {
      type: String,
    },
    descreption: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
  },

  card: [{
    title: {
      type: String,
    },
    descreption: {
      type: String,
    },
  }]

});

const TechnologySection = mongoose.model(
  "TechnologySection",
  technologySectionSchema
);

module.exports = TechnologySection;
