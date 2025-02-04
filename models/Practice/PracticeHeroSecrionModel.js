const mongoose = require("mongoose");

const practiceHeroSectionSchema = new mongoose.Schema({
  subheading: {
    type: String,
  },
  card: [{
    title: {
      type: String,
    },
    imageUrl:{
        
    }
  }]

});

const practiceHeroSectionModel = mongoose.model(
  "practiceHeroSectionModel",
  practiceHeroSectionSchema
);

module.exports = practiceHeroSectionModel;