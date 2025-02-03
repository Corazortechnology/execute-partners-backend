const mongoose = require("mongoose");

const CallToPartnerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Ready to partner with us?",
      required: true,
    },
    buttonText: {
      type: String,
      default: "Get Started",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallToPartner", CallToPartnerSchema);
