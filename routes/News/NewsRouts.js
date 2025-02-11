const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getNews, getAllNews, updateSubheading, addCard, updateCard, deleteCard, addContentToCard, updateContentInCard, deleteContentFromCard } = require("../../controllers/News/newsController");

// Use memory storage to store file in memory before uploading to Azure
const storage = multer.memoryStorage();
const upload = multer({ storage });


// 📌 **Get all insights (subheading + cards)**
router.get("/", getAllNews);

// 📌 **Get a specific card by ID**
router.get("/card/:id", getNews);

// 📌 **Update the subheading**
router.put("/subheading", updateSubheading);

// 📌 **Add a new card (with image upload)**
router.post("/card", upload.single("image"), addCard);

// 📌 **Update a specific card by ID (with image upload)**
router.put("/card/:id", upload.single("image"), updateCard);

// 📌 **Delete a specific card by ID**
router.delete("/card/:id", deleteCard);

// 📌 **Add content to a card (with optional image/video upload)**
router.post("/card/:id/content", upload.fields([{ name: "image" }, { name: "video" }]), addContentToCard);

// 📌 **Update content inside a card (with optional image/video upload)**
router.put("/card/:cardId/content/:contentId", upload.fields([{ name: "image" }, { name: "video" }]), updateContentInCard);

// 📌 **Delete content inside a specific card**
router.delete("/card/:cardId/content/:contentId", deleteContentFromCard);

module.exports = router;
