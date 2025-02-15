const mongoose = require("mongoose");

const PartnerRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    companyType: { type: String, required: true },
    aboutCompany: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PartnerRequest = mongoose.model("PartnerRequest", PartnerRequestSchema);
module.exports = PartnerRequest;
