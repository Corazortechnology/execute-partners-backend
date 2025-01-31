const express = require("express");
const router = express.Router();
const {
  getRedCardSection,
  updateQuoteAndAuthor,
  addCard,
  updateCard,
  deleteCard,
} = require("../../controllers/Practice/RedCardController");

// Fetch the red card section (cards, quote, author)
router.get("/", getRedCardSection);

// Add or update the quote and author
router.post("/quote", updateQuoteAndAuthor);

// Add a new card
router.post("/card", addCard);

// Update a specific card by ID
router.put("/card/:id", updateCard);

// Delete a specific card by ID
router.delete("/card/:id", deleteCard);

module.exports = router;
