const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  quoteText: {
    type: String,
    required: true,
  }
});

const Quote = mongoose.model("homeQuote", quoteSchema);

module.exports = Quote;
