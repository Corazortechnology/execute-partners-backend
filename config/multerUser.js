const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../services/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user-profile", // 👈 stores in a separate folder
    allowed_formats: ["jpeg", "png", "jpg", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }], // Optional: tailor for articles
  },
});

const uploadProfile = multer({ storage });

module.exports = uploadProfile;
