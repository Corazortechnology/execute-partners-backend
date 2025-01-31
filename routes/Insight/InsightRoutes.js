const express = require("express");
const router = express.Router();
const multer = require("multer");
// Use memory storage to store file in memory before uploading to Azure
const storage = multer.memoryStorage();
const upload = multer({ storage });
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
router.post("/card", upload.single("imageUrl"), addCard);

// Update a specific card by ID
router.put("/card/:id", updateCard);

// Delete a specific card by ID
router.delete("/card/:id", deleteCard);

module.exports = router;
