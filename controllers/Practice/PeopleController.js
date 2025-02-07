const PeopleSection = require("../../models/Practice/peopleMdel");
const azureBlobService = require("../../services/azureBlobService");

// Fetch the Technology Section
exports.getPeopleSection = async (req, res) => {
  try {
    let section = await PeopleSection.findOne();

    // If no section exists, create a default one
    if (!section) {
      section = await PeopleSection.create({
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
      message: "People section retrieved successfully.",
      data: section,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving People section.", error });
  }
};

// Add or Update the Subheading and Content with Image Upload
exports.upsertPeopleSection = async (req, res) => {
  try {
    const { subheading } = req.body;
    let content = JSON.parse(req.body.content); // Parse the JSON string manually

    // Find the existing section to retain the current image URL if no new image is uploaded
    const existingSection = await PeopleSection.findOne();

    let updateData = {
      subheading,
      content: {
        title: content.title,
        descreption: content.descreption,
        imageUrl: existingSection?.content?.imageUrl, // Retain the existing image URL
      },
    };

    // Handle Image Upload to Azure Blob Storage if a new file is provided
    if (req.file) {
      const imageUrl = await azureBlobService.uploadToAzure(
        req.file.buffer,
        req.file.originalname
      );
      updateData.content.imageUrl = imageUrl; // Replace with the new uploaded image URL
    }

    // Upsert: Create or update the Technology Section
    const section = await PeopleSection.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
    });

    res.status(200).json({
      message: "People section updated successfully.",
      data: section,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Error saving People section.", error });
  }
};

// Add a New Card
exports.addCard = async (req, res) => {
  try {
    const { title, descreption } = req.body;

    const section = await PeopleSection.findOne();
    if (!section) {
      return res.status(404).json({ message: "People section not found." });
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

    const section = await PeopleSection.findOne();
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

    const section = await PeopleSection.findOne();
    if (!section) {
      return res.status(404).json({ message: "Technology section not found." });
    }

    const cardIndex = section.card.findIndex(
      (card) => card._id.toString() === id
    );
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
