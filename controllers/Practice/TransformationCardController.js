const TransformationCardModel = require("../../models/Practice/TransformationCardModel");
const azureBlobService = require("../../services/azureBlobService");

// Fetch the Technology Section
exports.getTransformationCardModel = async (req, res) => {
  try {
    let section = await TransformationCardModel.findOne();

    // If no section exists, create a default one
    if (!section) {
      section = await TransformationCardModel.create({
        subheading: "Default Subheading",
        content: {
          title: "Default Title",
          descreption: "Default Description",
          imageUrl: "",
        },
        card: [],
      });
    }

    res.status(200).json({
      message: "Transformation section retrieved successfully.",
      data: section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Transformation section.", error });
  }
};




// Add or Update the Subheading and Content with Image Upload
exports.upsertTransformationCardModel = async (req, res) => {
  try {
  

    const { subheading } = req.body;
    let content = JSON.parse(req.body.content); // Manually parse the JSON string

    // Find the existing section to retain the previous image URL if no new image is provided
    const existingSection = await TransformationCardModel.findOne();

    let updateData = {
      subheading,
      content: {
        title: content.title,
        descreption: content.descreption,
        imageUrl: existingSection?.content?.imageUrl, // Default to existing image URL
      },
    };

    // Handle Image Upload to Azure Blob Storage
    if (req.file) {
      const imageUrl = await azureBlobService.uploadToAzure(req.file.buffer, req.file.originalname);
      updateData.content.imageUrl = imageUrl; // Set the uploaded image URL
    }

    // Upsert: Create or update the Transformation Card Model
    const section = await TransformationCardModel.findOneAndUpdate({}, updateData, { new: true, upsert: true });

    res.status(200).json({
      message: "Transformation Card updated successfully.",
      data: section,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Error saving Transformation Card.", error });
  }
};




// Add a New Card
exports.addCard = async (req, res) => {
  try {
    const { title, descreption } = req.body;

    const section = await TransformationCardModel.findOne();
    if (!section) {
      return res.status(404).json({ message: "Technology section not found." });
    }

    section.card.push({ title, descreption }); // Add the new card
    await section.save();

    res.status(201).json({
      message: "Card added successfully.",
      data: section.card[section.card.length - 1], // Return the newly added card
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding card.", error });
  }
};

// Update a Specific Card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params; // Get card ID from params
    const { title, descreption } = req.body;

    const section = await TransformationCardModel.findOne();
    if (!section) {
      return res.status(404).json({ message: "Technology section not found." });
    }

    const card = section.card.id(id); // Find the card by ID
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Update card fields
    card.title = title || card.title;
    card.descreption = descreption || card.descreption;

    await section.save();

    res.status(200).json({
      message: "Card updated successfully.",
      data: card,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating card.", error });
  }
};

// Delete a Specific Card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params; // Get card ID from params

    const section = await TransformationCardModel.findOne();
    if (!section) {
      return res.status(404).json({ message: "Technology section not found." });
    }

    const cardIndex = section.card.findIndex((card) => card._id.toString() === id);
    if (cardIndex === -1) {
      return res.status(404).json({ message: "Card not found." });
    }

    section.card.splice(cardIndex, 1); // Remove the card
    await section.save();

    res.status(200).json({
      message: "Card deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting card.", error });
  }
};
