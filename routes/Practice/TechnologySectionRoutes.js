const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

const { getTechnologySection, upsertTechnologySection, addCard, updateCard, deleteCard } = require("../../controllers/Practice/TechnologySectionController");

router.get("/", getTechnologySection);
router.put("/", upload.single("image"), upsertTechnologySection);
router.post("/card", addCard);
router.put("/card/:id", updateCard);
router.delete("/card/:id", deleteCard);

module.exports = router;