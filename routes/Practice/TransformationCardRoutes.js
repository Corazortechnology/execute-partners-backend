const express = require("express");
const multer = require("multer");
const { getTransformationCardModel, upsertTransformationCardModel, addCard, updateCard, deleteCard } = require("../../controllers/Practice/TransformationCardController");

const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

router.get("/", getTransformationCardModel);
router.put("/", upload.single("image"), upsertTransformationCardModel);
router.post("/card", addCard);
router.put("/card/:id", updateCard);
router.delete("/card/:id", deleteCard);

module.exports = router;

