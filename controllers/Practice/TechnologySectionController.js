const TechnologySection = require("../../models/Practice/TechnologySectionModel");
const azureBlobService = require("../../services/azureBlobService");

// Fetch the Technology Section
exports.getTechnologySection = async (req, res) => {
  try {
    const section = await TechnologySection.findOne();
    if (!section) {
      return res.status(404).json({ message: "Technology section not found." });
    }

    res.status(200).json({
      message: "Technology section retrieved successfully.",
      data: section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving technology section.", error });
  }
};

// Add or Update the Technology Section
exports.upsertTechnologySection = async (req, res) => {
  try {
    const { subheading, content } = req.body;
    const image = req.file;

    let updateData = { subheading, content };

    if (image) {
      // Upload the new image to Azure Blob Storage
      const imageUrl = await azureBlobService.uploadToAzure(
        image.buffer,
        image.originalname
      );

      // Include the new image URL
      updateData.imageUrl = imageUrl;
    }

    // Upsert: Create or update the Technology Section
    const section = await TechnologySection.findOneAndUpdate(
      {}, // Match the first document
      updateData,
      { new: true, upsert: true } // Create if it doesn't exist
    );

    res.status(200).json({
      message: "Technology section updated successfully.",
      data: section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving technology section.", error });
  }
};

// Delete the Technology Section
exports.deleteTechnologySection = async (req, res) => {
  try {
    const section = await TechnologySection.findOneAndDelete();
    if (!section) {
      return res.status(404).json({ message: "Technology section not found." });
    }

    // Delete the associated image from Azure Blob Storage
    if (section.imageUrl) {
      await azureBlobService.deleteFromAzure(section.imageUrl);
    }

    res.status(200).json({
      message: "Technology section deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting technology section.", error });
  }
};
