const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  quoteText: {
    type: String,
    required: true,
  }
});

const Quote = mongoose.model("contactQuote", quoteSchema);

module.exports = Quote;
