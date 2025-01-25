const express = require("express");
const router = express.Router();
const {
  getInsights,
  updateSubheading,
  addCard,
  updateCard,
  deleteCard,
} = require("../../controllers/Insight/InsightController");

// Get all insights data (subheading + cards)
router.get("/", getInsights);

// Update the subheading
router.put("/subheading", updateSubheading);

// Add a new card
router.post("/card", addCard);

// Update a specific card by ID
router.patch("/card/:id", updateCard);

// Delete a specific card by ID
router.delete("/card/:id", deleteCard);

module.exports = router;
