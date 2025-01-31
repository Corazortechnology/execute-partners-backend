const YellowCard = require("../../models/Practice/YellowCardModel");

// Fetch all cards
exports.getAllCards = async (req, res) => {
  try {
    const cards = await YellowCard.find({});
    res.status(200).json({
      message: "Cards retrieved successfully.",
      data: cards,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cards.", error });
  }
};

// Fetch a specific card by ID
exports.getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await YellowCard.findById(id);

    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    res.status(200).json({
      message: "Card retrieved successfully.",
      data: card,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving card.", error });
  }
};

// Add a new card
exports.addCard = async (req, res) => {
  try {
    const { heading, description } = req.body;

    const newCard = await YellowCard.create({ heading, description });

    res.status(201).json({
      message: "Card created successfully.",
      data: newCard,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating card.", error });
  }
};

// Update a specific card by ID
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description } = req.body;

    const updatedCard = await YellowCard.findByIdAndUpdate(
      id,
      { heading, description },
      { new: true } // Return the updated document
    );

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found." });
    }

    res.status(200).json({
      message: "Card updated successfully.",
      data: updatedCard,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating card.", error });
  }
};

// Delete a specific card by ID
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCard = await YellowCard.findByIdAndDelete(id);

    if (!deletedCard) {
      return res.status(404).json({ message: "Card not found." });
    }

    res.status(200).json({
      message: "Card deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting card.", error });
  }
};
