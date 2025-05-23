const express = require("express");
const multer = require("multer");
const leadershipController = require("../../controllers/About/LeadershipSectionController");

const router = express.Router();
const upload = multer(); // For handling multipart form-data

// Route to fetch Leadership data
router.get("/", leadershipController.getLeadership);

// Route to create Leadership entry
router.post("/", upload.single("image"), leadershipController.createLeadership);

// Route to update Leadership entry
router.patch(
  "/:id",
  upload.single("image"),
  leadershipController.updateLeadership
);

// delete route
router.delete("/:id", leadershipController.deleteLeadership);

module.exports = router;
