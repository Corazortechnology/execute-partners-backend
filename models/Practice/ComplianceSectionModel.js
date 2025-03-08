const mongoose = require("mongoose");

const complianceSectionSchema = new mongoose.Schema({
  subheading: { type: String, required: true }, // Subheading text
  content: { type: String, required: true }, // Content/description text
  imageUrl: { type: String, required: true }, // URL for the image (stored in Azure Blob Storage)
});

const ComplianceSection = mongoose.model(
  "ComplianceSection",
  complianceSectionSchema
);

module.exports = ComplianceSection;
