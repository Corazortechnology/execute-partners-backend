const Careers = require("../../models/Career/Career");

// Get all careers data (subheading + cards)
exports.getCareers = async (req, res) => {
  try {
    const careers = await Careers.findOne();
    if (!careers) {
      return res.status(404).json({ message: "Careers data not found." });
    }
    res.status(200).json({
      message: "Careers data retrieved successfully",
      data: careers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving careers data", error });
  }
};

// Update the subheading
exports.updateSubheading = async (req, res) => {
  try {
    const { subheading } = req.body;

    const careers = await Careers.findOneAndUpdate(
      {}, // Match the first document
      { subheading },
      { new: true, upsert: true } // Create if it doesn't exist
    );

    res.status(200).json({
      message: "Subheading updated successfully",
      data: careers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating subheading", error });
  }
};

// Add a new card
exports.addCard = async (req, res) => {
  try {
    const { heading, description } = req.body;

    let careers = await Careers.findOne();
    if (!careers) {
      careers = new Careers({ cards: [] }); // Initialize cards array if it doesn't exist
    }

    careers.cards.push({ heading, description });

    await careers.save();

    res.status(201).json({
      message: "Card added successfully",
      data: careers.cards[careers.cards.length - 1], // Return the newly added card
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding card", error });
  }
};

// Update a specific card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params; // Retrieve card ID from params
    const { heading, description } = req.body;

    const careers = await Careers.findOne();
    if (!careers) {
      return res.status(404).json({ message: "Careers data not found." });
    }

    const card = careers.cards.id(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Update card fields
    card.heading = heading || card.heading;
    card.description = description || card.description;

    await careers.save();

    res.status(200).json({
      message: "Card updated successfully",
      data: card,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating card", error });
  }
};

// Delete a specific card
exports.deleteCard = async (req, res) => {
    try {
      const { id } = req.params; // Retrieve card ID from params
  
      const careers = await Careers.findOne();
      if (!careers) {
        return res.status(404).json({ message: "Careers data not found." });
      }
  
      // Find the card by ID and delete it using the `delete` method
      const cardIndex = careers.cards.findIndex((card) => card._id.toString() === id);
      if (cardIndex === -1) {
        return res.status(404).json({ message: "Card not found." });
      }
  
      // Remove the card from the array
      careers.cards.splice(cardIndex, 1);
  
      await careers.save(); // Save the changes to the database
  
      res.status(200).json({
        message: "Card deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Error deleting card", error });
    }
};
  
