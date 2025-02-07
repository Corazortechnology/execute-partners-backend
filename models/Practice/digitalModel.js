const mongoose = require("mongoose");

const DigitalSchema = new mongoose.Schema({
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

const DigitalSection = mongoose.model(
  "DigitalModel",
  DigitalSchema
);

module.exports = DigitalSection;