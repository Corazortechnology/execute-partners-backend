const express = require("express");
const multer = require("multer");
const {
  getKeyPillars,
  updateKeyPillars,
  addCard,
  updateCard,
  deleteCard,
} = require("../../controllers/About/KeyPillarSectionController");
const upload = multer(); // Middleware for handling file uploads
const router = express.Router();

// Fetch Key Pillars section
router.get("/", getKeyPillars);

// Update Key Pillars section (Header & Description)
router.put("/", updateKeyPillars);

// Add a new card
router.post("/card", upload.single("image"), addCard);

// Update an existing card
router.put("/card/:id", upload.single("image"), updateCard);

// Delete a card
router.delete("/card/:id", deleteCard);

module.exports = router;
