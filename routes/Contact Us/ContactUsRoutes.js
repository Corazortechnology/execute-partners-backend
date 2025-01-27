const express = require("express");
const router = express.Router();
const {
  getContactData,
  updateSubheading,
  addCard,
  updateCard,
  deleteCard,
} = require("../../controllers/Contact Us/ContactUsController");

// Get all careers data (subheading + cards)
router.get("/", getContactData);

// Update the subheading
router.put("/subheading", updateSubheading);

// Add a new card
router.post("/card", addCard);

// Update a specific card by ID
router.patch("/card/:id", updateCard);

// Delete a specific card by ID
router.delete("/card/:id", deleteCard);

module.exports = router;
