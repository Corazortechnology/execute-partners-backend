const mongoose = require('mongoose');

const transformationCardSchema = new mongoose.Schema({
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

  card:[{
    title: {
      type: String,
    },
    descreption: {
      type: String,
    },
  }]   
});

module.exports = mongoose.model('TransformationCard', transformationCardSchema);
