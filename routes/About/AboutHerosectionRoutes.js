const express = require("express");
const aboutController = require("../../controllers/About/AboutHeroSectionController");

const router = express.Router();

// Route to get "About Us" data
router.get("/", aboutController.getAbout);

// Route to create "About Us" data
router.post("/", aboutController.createAbout);

// Route to update "About Us" data
router.patch("/", aboutController.updateAbout);

module.exports = router;

// const express = require("express");
// const multer = require("multer");
// const aboutController = require("../../controllers/About/AboutHeroSectionController");

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory before upload

// // **🔹 Route to get "About Us" data (Returns Secure Video URL if Video Exists)**
// router.get("/", aboutController.getAbout);

// // **🔹 Route to create "About Us" data (Supports Image/Video Upload)**
// router.post("/", upload.single("file"), aboutController.createAbout);

// // **🔹 Route to update "About Us" data (Deletes Old Media if New One is Uploaded)**
// router.patch("/", upload.single("file"), aboutController.updateAbout);

// module.exports = router;
