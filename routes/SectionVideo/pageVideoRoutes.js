const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadVideo, getAllVideos, getVideoByPage, deleteVideo, updateVideo } = require("../../controllers/Video section/pageVideo");

// Use memory storage to store file in memory before uploading to Azure
const storage = multer.memoryStorage();
const upload = multer({ storage });


// ✅ Upload Video
router.post("/upload", upload.single("video"), uploadVideo);

// ✅ Get All Videos
router.get("/", getAllVideos);

// ✅ Get Video by Page Name
router.get("/:pageName", getVideoByPage);

// ✅ Update Video by Page Name
router.put("/:pageName", upload.single("video"),updateVideo);


// ✅ Delete Video by ID
router.delete("/:id", deleteVideo);

module.exports = router;
