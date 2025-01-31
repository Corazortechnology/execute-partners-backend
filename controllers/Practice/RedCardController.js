const RedCardSection = require("../../models/Practice/RedCardModel");

// Fetch the entire Red Card Section (cards, quote, author)
exports.getRedCardSection = async (req, res) => {
  try {
    const section = await RedCardSection.findOne();
    if (!section) {
      return res.status(404).json({ message: "Red card section not found." });
    }

    res.status(200).json({
      message: "Red card section retrieved successfully.",
      data: section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving red card section.", error });
  }
};

// Add or update the quote and author
exports.updateQuoteAndAuthor = async (req, res) => {
  try {
    const { quote, author } = req.body;

    const section = await RedCardSection.findOneAndUpdate(
      {}, // Match the first document
      { quote, author },
      { new: true, upsert: true } // Create if it doesn't exist
    );

    res.status(200).json({
      message: "Quote and author updated successfully.",
      data: section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating quote and author.", error });
  }
};

// Add a new card
exports.addCard = async (req, res) => {
  try {
    const { heading, description } = req.body;

    let section = await RedCardSection.findOne();
    if (!section) {
      section = new RedCardSection({ cards: [], quote: "", author: "" });
    }

    section.cards.push({ heading, description });

    await section.save();

    res.status(201).json({
      message: "Card added successfully.",
      data: section.cards[section.cards.length - 1], // Return the newly added card
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding card.", error });
  }
};

// Update a specific card by ID
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description } = req.body;

    const section = await RedCardSection.findOne();
    if (!section) {
      return res.status(404).json({ message: "Red card section not found." });
    }

    const card = section.cards.id(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Update the card fields
    card.heading = heading || card.heading;
    card.description = description || card.description;

    await section.save();

    res.status(200).json({
      message: "Card updated successfully.",
      data: card,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating card.", error });
  }
};

// Delete a specific card by ID
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await RedCardSection.findOne();
    if (!section) {
      return res.status(404).json({ message: "Red card section not found." });
    }

    const card = section.cards.id(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Remove the card
    card.remove();

    await section.save();

    res.status(200).json({
      message: "Card deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting card.", error });
  }
};
