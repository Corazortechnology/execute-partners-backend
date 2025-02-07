const express = require("express");
const multer = require("multer");
const { gettreasuryImplementations, upserttreasuryImplementations, deleteCard, addCard, updateCard } = require("../../controllers/Practice/TresurtImplementation");

const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

router.get("/", gettreasuryImplementations);
router.put("/", upload.single("image"), upserttreasuryImplementations);
router.post("/card", addCard);
router.put("/card/:id", updateCard);
router.delete("/card/:id", deleteCard);

module.exports = router;