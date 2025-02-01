const Leadership = require("../../models/About/LeadershipSectionModel");
const azureBlobService = require("../../services/azureBlobService");
const deleteFromAzure = require("../../services/azureBlobService");

// Fetch Leadership data
exports.getLeadership = async function (req, res) {
  try {
    const leadership = await Leadership.find({});
    res.status(200).send(leadership);
  } catch (err) {
    res.status(500).send({ error: "Error fetching leadership data." });
  }
};

// Create Leadership entry
exports.createLeadership = async function (req, res) {
  try {
    const { name, title, description } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).send({ error: "Image file is required." });
    }

    // Upload image to Azure Blob Storage
    const imageUrl = await azureBlobService.uploadToAzure(
      image.buffer,
      image.originalname
    );

    // Create new Leadership entry
    const leadership = new Leadership({
      name,
      title,
      description,
      imageUrl,
    });

    const savedLeadership = await leadership.save();
    res.status(201).send(savedLeadership);
  } catch (err) {
    res.status(500).send({ error: "Error creating leadership entry." });
  }
};

// Update Leadership entry
exports.updateLeadership = async function (req, res) {
  try {
    const { id } = req.params;
    const { name, title, description } = req.body;
    const image = req.file;

    // Prepare the data to update
    let updateData = { name, title, description };

    if (image) {
      // If a new image is provided, upload it to Azure Blob Storage
      const imageUrl = await azureBlobService.uploadToAzure(
        image.buffer,
        image.originalname
      );

      // Include the new image URL in the update data
      updateData.imageUrl = imageUrl;

      // Remove the old image from Azure Blob Storage
      const existingLeadership = await Leadership.findById(id);
      if (existingLeadership && existingLeadership.imageUrl) {
        await azureBlobService.deleteFromAzure(existingLeadership.imageUrl);
      }
    }

    // Update the leadership record
    const updatedLeadership = await Leadership.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedLeadership) {
      return res.status(404).send({ error: "Leadership entry not found." });
    }

    res.status(200).send(updatedLeadership);
  } catch (err) {
    res.status(500).send({ error: "Error updating leadership entry." });
  }
};

exports.deleteLeadership = async function (req, res) {
  try {
    const { id } = req.params;

    // Find the leadership entry
    const leadership = await Leadership.findById(id);

    if (!leadership) {
      return res.status(404).send({ error: "Leadership entry not found." });
    }

    // Remove the image from Azure Blob Storage
    if (leadership.imageUrl) {
      await azureBlobService.deleteFromAzure(leadership.imageUrl);
    }

    // Delete the leadership entry from the database
    await Leadership.findByIdAndDelete(id);

    res.status(200).send({ message: "Leadership entry deleted successfully." });
  } catch (err) {
    res.status(500).send({ error: "Error deleting leadership entry." });
  }
};
