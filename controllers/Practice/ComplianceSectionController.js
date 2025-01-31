const ComplianceSection = require("../../models/Practice/ComplianceSectionModel");
const azureBlobService = require("../../services/azureBlobService");

// Fetch the Compliance Section
exports.getComplianceSection = async (req, res) => {
  try {
    const section = await ComplianceSection.findOne();
    if (!section) {
      return res.status(404).json({ message: "Compliance section not found." });
    }

    res.status(200).json({
      message: "Compliance section retrieved successfully.",
      data: section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving compliance section.", error });
  }
};

// Add or Update the Compliance Section
exports.upsertComplianceSection = async (req, res) => {
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

    // Upsert: Create or update the Compliance Section
    const section = await ComplianceSection.findOneAndUpdate(
      {}, // Match the first document
      updateData,
      { new: true, upsert: true } // Create if it doesn't exist
    );

    res.status(200).json({
      message: "Compliance section updated successfully.",
      data: section,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving compliance section.", error });
  }
};

// Delete the Compliance Section
exports.deleteComplianceSection = async (req, res) => {
  try {
    const section = await ComplianceSection.findOneAndDelete();
    if (!section) {
      return res.status(404).json({ message: "Compliance section not found." });
    }

    // Delete the associated image from Azure Blob Storage
    if (section.imageUrl) {
      await azureBlobService.deleteFromAzure(section.imageUrl);
    }

    res.status(200).json({
      message: "Compliance section deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting compliance section.", error });
  }
};
