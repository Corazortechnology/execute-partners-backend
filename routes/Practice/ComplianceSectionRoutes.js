const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

const {
  getComplianceSection,
  upsertComplianceSection,
  deleteComplianceSection,
} = require("../../controllers/Practice/ComplianceSectionController");

// Fetch the compliance section
router.get("/", getComplianceSection);

// Add or update the compliance section
router.post("/", upload.single("image"), upsertComplianceSection);

// Delete the compliance section
router.delete("/", deleteComplianceSection);

module.exports = router;
