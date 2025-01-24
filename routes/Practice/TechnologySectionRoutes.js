const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

const {
  getTechnologySection,
  upsertTechnologySection,
  deleteTechnologySection,
} = require("../../controllers/Practice/TechnologySectionController");

// Get the technology section
router.get("/", getTechnologySection);

// Add or update the technology section
router.post("/", upload.single("image"), upsertTechnologySection);

// Delete the technology section
router.delete("/", deleteTechnologySection);

module.exports = router;
