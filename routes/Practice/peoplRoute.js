const express = require("express");
const multer = require("multer");
const {
  getPeopleSection,
  upsertPeopleSection,
  addCard,
  updateCard,
  deleteCard,
} = require("../../controllers/Practice/PeopleController");

const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

router.get("/", getPeopleSection);
router.put("/", upload.single("image"), upsertPeopleSection);
router.post("/card", addCard);
router.put("/card/:id", updateCard);
router.delete("/card/:id", deleteCard);

module.exports = router;
