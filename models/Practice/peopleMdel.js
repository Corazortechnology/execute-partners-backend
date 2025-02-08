const mongoose = require("mongoose");

const PeopleSchema = new mongoose.Schema({
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

  card: [
    {
      title: {
        type: String,
      },
      descreption: {
        type: String,
      },
    },
  ],
});

const PeopleSection = mongoose.model("PeopleModel", PeopleSchema);

module.exports = PeopleSection;
