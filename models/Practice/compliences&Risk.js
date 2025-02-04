const mongoose = require("mongoose");

const CompliencesSchema = new mongoose.Schema({
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

const CompliencesSection = mongoose.model(
  "CompliencesModel",
  CompliencesSchema
);

module.exports = CompliencesSection;