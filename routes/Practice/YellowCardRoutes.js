const express = require("express");
const router = express.Router();
const yellowCardController = require("../../controllers/Practice/YellowCardController");

// Fetch all cards
router.get("/", yellowCardController.getAllCards);

// Fetch a specific card by ID
router.get("/:id", yellowCardController.getCardById);

// Add a new card
router.post("/", yellowCardController.addCard);

// Update a specific card by ID
router.patch("/:id", yellowCardController.updateCard);

// Delete a specific card by ID
router.delete("/:id", yellowCardController.deleteCard);

module.exports = router;
