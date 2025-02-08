const mongoose = require('mongoose');

const treasuryImplementationCardSchema = new mongoose.Schema({
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

module.exports = mongoose.model('treasurtImplementation', treasuryImplementationCardSchema);
