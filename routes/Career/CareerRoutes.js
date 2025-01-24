const express = require("express");
const router = express.Router();
const {
  getCareers,
  updateSubheading,
  addCard,
  updateCard,
  deleteCard,
} = require("../../controllers/Career/CareerController");

// Get all careers data (subheading + cards)
router.get("/", getCareers);

// Update the subheading
router.put("/subheading", updateSubheading);

// Add a new card
router.post("/card", addCard);

// Update a specific card by ID
router.patch("/card/:id", updateCard);

// Delete a specific card by ID
router.delete("/card/:id", deleteCard);

module.exports = router;
