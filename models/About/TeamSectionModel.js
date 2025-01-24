const mongoose = require('mongoose');

const teamAdvisorSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  name: { type: String, required: true },  
  description: { type: String, required: true }, 
  imageUrl: { type: String, required: true } 
});

module.exports = mongoose.model('TeamAdvisor', teamAdvisorSchema);
