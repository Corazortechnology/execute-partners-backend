const TransformationCard = require('../../models/Practice/TransformationCardModel');
const azureBlobService = require('../../services/azureBlobService');

// Fetch the transformation card
exports.getTransformationCard = async function (req, res) {
  try {
    const card = await TransformationCard.findOne({});
    if (!card) {
      return res.status(404).send({ error: 'Transformation card not found.' });
    }
    res.status(200).send(card);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching transformation card.' });
  }
};

// Create or update the transformation card
exports.upsertTransformationCard = async function (req, res) {
  try {
    const { subheading, content } = req.body;
    const image = req.file;

    // Prepare the data to update or create
    let updateData = { subheading, content };

    if (image) {
      // Upload the new image to Azure Blob Storage
      const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);

      // Include the new image URL
      updateData.imageUrl = imageUrl;
    }

    // Upsert: Create if not exists, or update the existing card
    const updatedCard = await TransformationCard.findOneAndUpdate(
      {}, // Match the first document
      updateData,
      { new: true, upsert: true } // Create if it doesn't exist
    );

    res.status(200).send(updatedCard);
  } catch (err) {
    res.status(500).send({ error: 'Error saving transformation card.' });
  }
};

// Delete the transformation card
exports.deleteTransformationCard = async function (req, res) {
  try {
    const card = await TransformationCard.findOneAndDelete({});
    if (!card) {
      return res.status(404).send({ error: 'Transformation card not found.' });
    }

    // Delete the associated image from Azure Blob Storage
    if (card.imageUrl) {
      await azureBlobService.deleteFromAzure(card.imageUrl);
    }

    res.status(200).send({ message: 'Transformation card deleted successfully.' });
  } catch (err) {
    res.status(500).send({ error: 'Error deleting transformation card.' });
  }
};
