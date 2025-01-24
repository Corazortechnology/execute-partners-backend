const mongoose = require('mongoose');

const transformationCardSchema = new mongoose.Schema({
  subheading: { type: String, required: true }, 
  content: { type: String, required: true },    
  imageUrl: { type: String, required: true }    
});

module.exports = mongoose.model('TransformationCard', transformationCardSchema);
