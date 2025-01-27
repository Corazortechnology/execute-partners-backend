const express = require("express");
const router = express.Router();
const {
  getInsights,
  getInsight,
  updateSubheading,
  addCard,
  updateCard,
  deleteCard,
} = require("../../controllers/Insight/InsightController");

// Get all insights data (subheading + cards)
router.get("/", getInsights);

router.get("/card/:id", getInsight);

// Update the subheading
router.put("/subheading", updateSubheading);

// Add a new card
router.post("/card", addCard);

// Update a specific card by ID
router.patch("/card/:id", updateCard);

// Delete a specific card by ID
router.delete("/card/:id", deleteCard);

module.exports = router;
