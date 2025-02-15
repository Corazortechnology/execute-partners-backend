
const PageVideo = require("../../models/SectionVideos/pageVideo");
const azureBlobService = require("../../services/azureBlobService");

// ✅ Upload Video for a Page
exports.uploadVideo = async (req, res) => {
  try {
    const { pageName } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    // Upload to Azure
    const videoUrl = await azureBlobService.uploadToAzure(
      req.file.buffer,
      req.file.originalname
    );

    // Check if a video already exists for the page
    let pageVideo = await PageVideo.findOne({ pageName });

    if (pageVideo) {
      pageVideo.videoUrl = videoUrl; // Update existing video
    } else {
      pageVideo = new PageVideo({ pageName, videoUrl }); // Create new entry
    }

    await pageVideo.save();

    res.status(201).json({ message: "Video uploaded successfully", data: pageVideo });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Fetch All Videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await PageVideo.find();
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Fetch Video by Page Name
exports.getVideoByPage = async (req, res) => {
  try {
    const { pageName } = req.params;
    const video = await PageVideo.findOne({ pageName });

    if (!video) {
      return res.status(404).json({ message: "No video found for this page" });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updateVideo = async (req, res) => {
    try {
      const { pageName } = req.params;
  
      // Check if a file is uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }
  
      // Upload new video to Azure
      const videoUrl = await azureBlobService.uploadToAzure(
        req.file.buffer,
        req.file.originalname
      );
  
      // Find and update video
      const updatedVideo = await PageVideo.findOneAndUpdate(
        { pageName },
        { videoUrl },
        { new: true }
      );
  
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found for this page" });
      }
  
      res.status(200).json({ message: "Video updated successfully", data: updatedVideo });
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };

// ✅ Delete Video by ID
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await PageVideo.findByIdAndDelete(id);
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}; 

