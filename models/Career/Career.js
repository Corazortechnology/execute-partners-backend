const mongoose = require("mongoose");

const careerSubtitleSchema = new mongoose.Schema({
  subtitle: {
    type: String,
    required: true,
    default:
      "We are seeking skilled professionals for consultancy assignments. Join our versatile community that thrives on delivering exceptional experiences",
  },
});

const careerCardSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    default: "Career Card",
  },
  description: {
    type: String,
    required: true,
    default: "Career description",
  },
});

const CarrerSubtitle = mongoose.model("CarrerSubtitle", careerSubtitleSchema);
const CareerCard = mongoose.model("CareerCard", careerCardSchema);

module.exports = { CareerCard, CarrerSubtitle };
