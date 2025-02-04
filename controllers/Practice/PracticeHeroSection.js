const practiceHeroSectionModel = require("../../models/Practice/PracticeHeroSecrionModel");
const azureBlobService = require("../../services/azureBlobService");

// ✅ Fetch or Create the Hero Section
exports.getOrCreateHeroSection = async (req, res) => {
    try {
        let section = await practiceHeroSectionModel.findOne();

        if (!section) {
            section = new practiceHeroSectionModel({
                subheading: "Default Subheading",
                card: [],
            });
            await section.save();
        }

        res.status(200).json({
            message: "Practice Hero Section retrieved successfully.",
            data: section,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving section.", error });
    }
};

// ✅ Edit Subheading
exports.updateSubheading = async (req, res) => {
    try {
        const { subheading } = req.body;

        let section = await practiceHeroSectionModel.findOne();
        if (!section) {
            return res.status(404).json({ message: "Section not found." });
        }

        section.subheading = subheading;
        await section.save();

        res.status(200).json({
            message: "Subheading updated successfully.",
            data: section,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating subheading.", error });
    }
};

// ✅ Add a New Card with Image Upload
exports.addCard = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required." });
        }

        const { title } = req.body;
        const imageUrl = await azureBlobService.uploadToAzure(req.file.buffer, req.file.originalname);

        let section = await practiceHeroSectionModel.findOne();
        if (!section) {
            return res.status(404).json({ message: "Section not found." });
        }

        const newCard = { title, imageUrl };
        section.card.push(newCard);
        await section.save();

        res.status(201).json({
            message: "Card added successfully.",
            data: newCard,
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding card.", error });
    }
};

// ✅ Edit a Specific Card
exports.updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        let section = await practiceHeroSectionModel.findOne();
        if (!section) {
            return res.status(404).json({ message: "Section not found." });
        }

        const card = section.card.id(id);
        if (!card) {
            return res.status(404).json({ message: "Card not found." });
        }

        if (title) card.title = title;

        // If an image is uploaded, update it
        if (req.file) {
            const imageUrl = await azureBlobService.uploadToAzure(req.file.buffer, req.file.originalname);
            card.imageUrl = imageUrl;
        }

        await section.save();

        res.status(200).json({
            message: "Card updated successfully.",
            data: card,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating card.", error });
    }
};

// ✅ Delete a Specific Card
exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;

        let section = await practiceHeroSectionModel.findOne();
        if (!section) {
            return res.status(404).json({ message: "Section not found." });
        }

        const cardIndex = section.card.findIndex((card) => card._id.toString() === id);
        if (cardIndex === -1) {
            return res.status(404).json({ message: "Card not found." });
        }

        // Delete image from Azure before removing the card
        await azureBlobService.deleteFromAzure(section.card[cardIndex].imageUrl);

        section.card.splice(cardIndex, 1);
        await section.save();

        res.status(200).json({
            message: "Card deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting card.", error });
    }
};
