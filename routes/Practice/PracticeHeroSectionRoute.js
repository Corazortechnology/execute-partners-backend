const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // Middleware for handling file uploads
const { getOrCreateHeroSection, updateSubheading, addCard, updateCard, deleteCard } = require("../../controllers/Practice/PracticeHeroSection");

router.get("/", getOrCreateHeroSection);
router.put("/subheading", updateSubheading);
router.post("/card", upload.single("image"),addCard);
router.put("/card/:id", upload.single("image"), updateCard);
router.delete("/card/:id", deleteCard);

module.exports = router;
