const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  quoteText: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
});

const Quote = mongoose.model("Quote", quoteSchema);

module.exports = Quote;
