const Principle = require('../../models/About/PrincipleSectionModel');
const azureBlobService = require('../../services/azureBlobService');

// Fetch all partner cards
exports.getAllPrinciples = async function (req, res) {
  try {
    const principles = await Principle.find({});
    res.status(200).send(principles);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching principles cards.' });
  }
};

// Create a new partner card
exports.createPrinciple = async function (req, res) {
  try {
    const { title,  description} = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).send({ error: 'Image file is required.' });
    }

    // Upload image to Azure Blob Storage
    const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);

    // Create a new card
    const principle = new Principle({
      title,   
      description,
      imageUrl
    });

    const savedPrinciple = await principle.save();
    res.status(201).send(savedPrinciple);
  } catch (err) {
    res.status(500).send({ error: 'Error creating principle card.' });
  }
};

// Update a specific partner card
exports.updatePrinciple = async function (req, res) {
    try {
      const { id } = req.params; // Retrieve ID from URL parameters
      const { title,  description} = req.body; // Retrieve other fields from the request body
      const image = req.file; // Retrieve the file (if provided)
  
      let updateData = { title,  description}; // Prepare the fields to update
  
      if (image) {
        // Upload the new image to Azure Blob Storage
        const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);
  
        // Find the existing partner card to delete its old image
        const existingPrinciple = await Principle.findById(id);
        if (existingPrinciple && existingPrinciple.imageUrl) {
          await azureBlobService.deleteFromAzure(existingPrinciple.imageUrl); // Delete the old image
        }
  
        updateData.imageUrl = imageUrl; // Add the new image URL to the update data
      }
  
      // Update the partner card in the database
      const updatedPrinciple = await Principle.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedPrinciple) {
        return res.status(404).send({ error: 'Principle card not found.' });
      }
  
      res.status(200).send(updatedPrinciple); // Send the updated partner card
    } catch (err) {
      res.status(500).send({ error: 'Error updating principle card.' });
    }
  };
  
// Delete a partner card
exports.deletePrinciple = async function (req, res) {
  try {
    const { id } = req.params;

    const principle= await Principle.findByIdAndDelete(id);
    if (!principle) {
      return res.status(404).send({ error: 'Partner card not found.' });
    }

    // Delete the associated image from Azure Blob Storage
    if (principle.imageUrl) {
      await azureBlobService.deleteFromAzure(principle.imageUrl);
    }

    res.status(200).send({ message: 'Principle card deleted successfully.' });
  } catch (err) {
    res.status(500).send({ error: 'Error deleting principle card.' });
  }
};
