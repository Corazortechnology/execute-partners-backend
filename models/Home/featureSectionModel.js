const mongoose = require("mongoose");

const featureSectionSchema = new mongoose.Schema({
    header: {
        type: String,
        required: true,
    },
    subheader: {
        type: String,
        required: true,
    },
    cards: [
        {
            title: {
                type: String,
                required: true,
            },
            link: {
                type: String,
                required: true,
            },
        },
    ],
});

const FeatureSection = mongoose.model("FeatureSection", featureSectionSchema);

module.exports = FeatureSection;
