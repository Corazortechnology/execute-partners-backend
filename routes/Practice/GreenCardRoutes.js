const express = require("express");
const router = express.Router();
const greenCardController = require("../../controllers/Practice/GreenCardController");

// Get all cards
router.get("/", greenCardController.getAllCards);

// Get a specific card by ID
router.get("/:id", greenCardController.getCardById);

// Add a new card
router.post("/", greenCardController.addCard);

// Update a card by ID
router.patch("/:id", greenCardController.updateCard);

// Delete a card by ID
router.delete("/:id", greenCardController.deleteCard);

module.exports = router;
