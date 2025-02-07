const express = require("express");
const multer = require("multer");
const { getDigitalSection, upsertDigitalSection, addCard, updateCard, deleteCard } = require("../../controllers/Practice/DigitalControllar");
const router = express.Router();
const upload = multer(); // Middleware for handling file uploads


router.get("/", getDigitalSection);
router.put("/", upload.single("image"), upsertDigitalSection);
router.post("/card", addCard);
router.put("/card/:id", updateCard);
router.delete("/card/:id", deleteCard);

module.exports = router;