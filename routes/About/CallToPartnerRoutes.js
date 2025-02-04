const express = require("express");
const callToPartnerController = require("../../controllers/About/CallToPartnerController");

const router = express.Router();

// Ensure controller functions exist
if (!callToPartnerController.getCallToPartner) {
  throw new Error("Controller function 'getCallToPartner' is missing.");
}

// Route to fetch CallToPartner section
router.get("/", callToPartnerController.getCallToPartner);

// Route to create or update CallToPartner section
router.post("/", callToPartnerController.upsertCallToPartner);

// Route to delete CallToPartner section
router.delete("/", callToPartnerController.deleteCallToPartner);

module.exports = router;
