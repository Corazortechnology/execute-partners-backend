const express = require("express");
const { getFeatureSection, updateFeatureSection, addCard, editCard, deleteCard } = require("../../controllers/Home/featureSectionController");
const router = express.Router();

router.get("/feature-section", getFeatureSection);
router.put("/feature-section", updateFeatureSection);
router.post("/feature-section/card", addCard);
router.put("/feature-section/card/:id", editCard);
router.delete("/feature-section/card/:id", deleteCard);

module.exports = router;
