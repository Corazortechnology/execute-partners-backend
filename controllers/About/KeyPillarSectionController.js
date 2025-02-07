const KeyPillars = require("../../models/About/KeyPillarSectionModel");
const azureBlobService = require("../../services/azureBlobService");

// Fetch Key Pillars section
exports.getKeyPillars = async (req, res) => {
  try {
    let keyPillars = await KeyPillars.findOne();

    // If not found, create a new one
    if (!keyPillars) {
      keyPillars = await KeyPillars.create({
        heading: "Default Heading",
        description: "Default Description",
        cards: [],
      });
    }

    res.status(200).json({ message: "Success", data: keyPillars });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching Key Pillars data.", error: err });
  }
};

// Update heading and description (Create if not exists)

exports.updateKeyPillars = async (req, res) => {
  try {
    // Extract data from request
    const { heading, description } = req.body;

    // Validate incoming data
    if (!heading || !description) {
      return res
        .status(400)
        .json({ message: "Heading and description are required." });
    }

    // Update or Create (Upsert) the Key Pillars section
    const updatedKeyPillars = await KeyPillars.findOneAndUpdate(
      {}, // Empty filter means it updates the first (or only) document
      { heading, description },
      { new: true, upsert: true, runValidators: true } // Ensure validation
    );

    // Check if update was successful
    if (!updatedKeyPillars) {
      throw new Error("Failed to update Key Pillars.");
    }

    res.status(200).json({
      message: "Key Pillars updated successfully",
      data: updatedKeyPillars,
    });
  } catch (err) {
    console.error("Error updating Key Pillars:", err);
    res.status(500).json({
      message: "Error updating Key Pillars section.",
      error: err.message || err,
    });
  }
};

// Add a new card (Create document if none exists)
exports.addCard = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Upload image if provided
    let imageUrl = "";
    if (req.file) {
      imageUrl = await azureBlobService.uploadToAzure(
        req.file.buffer,
        req.file.originalname
      );
    }

    // Find or create Key Pillars document
    let keyPillars = await KeyPillars.findOne();
    if (!keyPillars) {
      keyPillars = await KeyPillars.create({
        heading: "Default",
        description: "Default",
        cards: [],
      });
    }

    // Add new card
    const newCard = { title, description, imageUrl };
    keyPillars.cards.push(newCard);
    await keyPillars.save();

    res.status(201).json({ message: "Card added successfully", data: newCard });
  } catch (err) {
    res.status(500).json({ message: "Error adding card.", error: err });
  }
};

// Update an existing card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await azureBlobService.uploadToAzure(
        req.file.buffer,
        req.file.originalname
      );
    }

    // Ensure Key Pillars document exists
    let keyPillars = await KeyPillars.findOne();
    if (!keyPillars) {
      return res
        .status(404)
        .json({ message: "Key Pillars section not found." });
    }

    // Find the card in the array
    const card = keyPillars.cards.id(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Update card details
    card.title = title || card.title;
    card.description = description || card.description;
    if (imageUrl) card.imageUrl = imageUrl;

    await keyPillars.save();

    res.status(200).json({ message: "Card updated successfully", data: card });
  } catch (err) {
    res.status(500).json({ message: "Error updating card.", error: err });
  }
};

// Delete a card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure Key Pillars document exists
    let keyPillars = await KeyPillars.findOne();
    if (!keyPillars) {
      return res
        .status(404)
        .json({ message: "Key Pillars section not found." });
    }

    // Find index of the card to be removed
    const cardIndex = keyPillars.cards.findIndex(
      (card) => card._id.toString() === id
    );
    if (cardIndex === -1) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Remove the card from array
    keyPillars.cards.splice(cardIndex, 1);
    await keyPillars.save();

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting card.", error: err });
  }
};
