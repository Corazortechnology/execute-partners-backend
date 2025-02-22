const mongoose = require("mongoose");

const DocumetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", DocumetSchema);
module.exports = Document;
