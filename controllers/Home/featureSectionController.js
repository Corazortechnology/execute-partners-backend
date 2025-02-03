const FeatureSection = require("../../models/Home/featureSectionModel");

// Get Feature Section
exports.getFeatureSection = async (req, res) => {
    try {
        const section = await FeatureSection.findOne();
        if (!section) {
            return res.status(404).json({ message: "Feature section not found" });
        }
        res.status(200).json({ message: "Feature section fetched successfully", data: section });
    } catch (error) {
        res.status(500).json({ message: "Error fetching feature section", error });
    }
};

// Update or Create Feature Section Header and Subheader
exports.updateFeatureSection = async (req, res) => {
    try {
        const { header, subheader } = req.body;

        const updatedSection = await FeatureSection.findOneAndUpdate(
            {},
            { header, subheader },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: "Feature section updated successfully",
            data: updatedSection,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating feature section", error });
    }
};

// Add Card
exports.addCard = async (req, res) => {
    try {
        const { title, link } = req.body;

        const section = await FeatureSection.findOne();
        if (!section) {
            return res.status(404).json({ message: "Feature section not found" });
        }

        section.cards.push({ title, link });
        await section.save();

        res.status(201).json({
            message: "Card added successfully",
            data: section.cards[section.cards.length - 1],
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding card", error });
    }
};

// Edit Card
exports.editCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, link } = req.body;

        const section = await FeatureSection.findOne();
        if (!section) {
            return res.status(404).json({ message: "Feature section not found" });
        }

        const card = section.cards.id(id);
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        card.title = title || card.title;
        card.link = link || card.link;

        await section.save();

        res.status(200).json({
            message: "Card updated successfully",
            data: card,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating card", error });
    }
};

// Delete Card
exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;

        const section = await FeatureSection.findOne();
        if (!section) {
            return res.status(404).json({ message: "Feature section not found" });
        }

        section.cards.id(id).remove();
        await section.save();

        res.status(200).json({ message: "Card deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting card", error });
    }
};
