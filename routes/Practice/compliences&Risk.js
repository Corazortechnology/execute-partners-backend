const express = require("express");
const multer = require("multer");
const { getTechnologySection, upsertTechnologySection, addCard, updateCard, deleteCard } = require("../../controllers/Practice/Compliences&Risk");
const router = express.Router();
const upload = multer(); // Middleware for handling file uploads


router.get("/", getTechnologySection);
router.put("/", upload.single("image"), upsertTechnologySection);
router.post("/card", addCard);
router.put("/card/:id", updateCard);
router.delete("/card/:id", deleteCard);

module.exports = router;