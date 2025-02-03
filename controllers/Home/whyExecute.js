const WhyExecute = require("../../models/Home/whyExecute");


// Get the "Why Execute?" data
exports.getWhyExecute = async (req, res) => {
    try {
        const data = await WhyExecute.findOne();
        if (!data) {
            return res.status(404).json({ message: "Data not found." });
        }
        res.status(200).json({ message: "Data retrieved successfully.", data });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving data.", error });
    }
};

// Update the heading and subheading
exports.updateHeading = async (req, res) => {
    try {
        const { heading, subheading } = req.body;
        const data = await WhyExecute.findOneAndUpdate(
            {},
            { heading, subheading },
            { new: true, upsert: true }
        );
        res.status(200).json({ message: "Heading updated successfully.", data });
    } catch (error) {
        res.status(500).json({ message: "Error updating heading.", error });
    }
};

// Add a new card
exports.addCard = async (req, res) => {
    try {
        const { title, description, icon } = req.body;
        const data = await WhyExecute.findOne();
        if (!data) {
            return res.status(404).json({ message: "Data not found." });
        }
        data.cards.push({ title, description, icon });
        await data.save();
        res.status(201).json({
            message: "Card added successfully.",
            data: data.cards[data.cards.length - 1],
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding card.", error });
    }
};

// Update a specific card
exports.updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, icon } = req.body;
        const data = await WhyExecute.findOne();
        if (!data) {
            return res.status(404).json({ message: "Data not found." });
        }
        const card = data.cards.id(id);
        if (!card) {
            return res.status(404).json({ message: "Card not found." });
        }
        card.title = title || card.title;
        card.description = description || card.description;
        card.icon = icon || card.icon;
        await data.save();
        res.status(200).json({ message: "Card updated successfully.", data: card });
    } catch (error) {
        res.status(500).json({ message: "Error updating card.", error });
    }
};

// Delete a specific card
exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await WhyExecute.findOne();
        if (!data) {
            return res.status(404).json({ message: "Data not found." });
        }
        data.cards = data.cards.filter((card) => card._id.toString() !== id);
        await data.save();
        res.status(200).json({ message: "Card deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting card.", error });
    }
};
