const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    default: 'About Us'
  },
  description: {
    type: String,
    required: true,
    default: 'At the heart of our identity lies a compelling vision, a steadfast mission, and a set of unwavering values that form the foundation of everything we do.'
  }
});

module.exports = mongoose.model('About', aboutSchema);
