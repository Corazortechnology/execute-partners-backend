const mongoose = require('mongoose');

const leadershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true 
  }
});

module.exports = mongoose.model('Leadership', leadershipSchema);
