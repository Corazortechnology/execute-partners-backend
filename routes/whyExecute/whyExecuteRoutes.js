const express = require("express");
const { getWhyExecute, updateHeading, addCard, updateCard, deleteCard } = require("../../controllers/whyExecute/whyExecute");
const router = express.Router();

// GET: Retrieve the "Why Execute?" data
router.get("/", getWhyExecute);

// PUT: Update the heading and subheading
router.put("/heading", updateHeading);

// POST: Add a new card
router.post("/card", addCard);

// PUT: Update a specific card by ID
router.put("/card/:id", updateCard);

// DELETE: Delete a specific card by ID
router.delete("/card/:id", deleteCard);

module.exports = router;
