const PracticeCard = require('../../models/Practice/PracticMainSectionModel');
const azureBlobService = require('../../services/azureBlobService');

// Fetch all practice cards
exports.getAllPracticeCards = async function (req, res) {
  try {
    const cards = await PracticeCard.find({});
    res.status(200).send(cards);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching practice cards.' });
  }
};

// Create a new practice card
exports.createPracticeCard = async function (req, res) {
  try {
    const { title, description } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).send({ error: 'Image file is required.' });
    }

    // Upload image to Azure Blob Storage
    const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);

    // Create a new practice card
    const practiceCard = new PracticeCard({
      title,
      description,
      imageUrl
    });

    const savedCard = await practiceCard.save();
    res.status(201).send(savedCard);
  } catch (err) {
    res.status(500).send({ error: 'Error creating practice card.' });
  }
};

// Update a specific practice card
exports.updatePracticeCard = async function (req, res) {
    try {
      const { id } = req.params; // Retrieve ID from URL parameters
      const { title, description } = req.body; // Retrieve other fields from the request body
      const image = req.file; // Retrieve the uploaded image file, if provided
  
      let updateData = { title, description }; // Prepare the fields to update
  
      if (image) {
        // Upload the new image to Azure Blob Storage
        const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);
  
        // Find the existing card to delete its old image
        const existingCard = await PracticeCard.findById(id);
        if (existingCard && existingCard.imageUrl) {
          await azureBlobService.deleteFromAzure(existingCard.imageUrl); // Delete the old image
        }
  
        updateData.imageUrl = imageUrl; // Add the new image URL to the update data
      }
  
      // Update the practice card in the database
      const updatedCard = await PracticeCard.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedCard) {
        return res.status(404).send({ error: 'Practice card not found.' });
      }
  
      res.status(200).send(updatedCard); // Send the updated practice card as a response
    } catch (err) {
      res.status(500).send({ error: 'Error updating practice card.' });
    }
};
  
// Delete a practice card
exports.deletePracticeCard = async function (req, res) {
  try {
    const { id } = req.params;

    const card = await PracticeCard.findByIdAndDelete(id);
    if (!card) {
      return res.status(404).send({ error: 'Practice card not found.' });
    }

    // Delete the associated image from Azure Blob Storage
    if (card.imageUrl) {
      await azureBlobService.deleteFromAzure(card.imageUrl);
    }

    res.status(200).send({ message: 'Practice card deleted successfully.' });
  } catch (err) {
    res.status(500).send({ error: 'Error deleting practice card.' });
  }
};
