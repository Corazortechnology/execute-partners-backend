const mongoose = require("mongoose");

const PageVideoSchema = new mongoose.Schema({
    pageName: {
        type: String,
        required: true,
        unique: true, // Ensures one video per page
    },
    videoUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const PageVideo = mongoose.model("PageVideo", PageVideoSchema);
module.exports = PageVideo;
