const Partner = require('../../models/About/PartnerSectionModel');
const azureBlobService = require('../../services/azureBlobService');

// Fetch all partner cards
exports.getAllPartners = async function (req, res) {
  try {
    const partners = await Partner.find({});
    res.status(200).send(partners);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching partner cards.' });
  }
};

// Create a new partner card
exports.createPartner = async function (req, res) {
  try {
    const { title, name, description, link } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).send({ error: 'Image file is required.' });
    }

    // Upload image to Azure Blob Storage
    const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);

    // Create a new card
    const partner = new Partner({
      title,
      name,
      description,
      link,
      imageUrl
    });

    const savedPartner = await partner.save();
    res.status(201).send(savedPartner);
  } catch (err) {
    res.status(500).send({ error: 'Error creating partner card.' });
  }
};

// Update a specific partner card
exports.updatePartner = async function (req, res) {
    try {
      const { id } = req.params; // Retrieve ID from URL parameters
      const { title, name, description, link } = req.body; // Retrieve other fields from the request body
      const image = req.file; // Retrieve the file (if provided)
  
      let updateData = { title, name, description, link }; // Prepare the fields to update
  
      if (image) {
        // Upload the new image to Azure Blob Storage
        const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);
  
        // Find the existing partner card to delete its old image
        const existingPartner = await Partner.findById(id);
        if (existingPartner && existingPartner.imageUrl) {
          await azureBlobService.deleteFromAzure(existingPartner.imageUrl); // Delete the old image
        }
  
        updateData.imageUrl = imageUrl; // Add the new image URL to the update data
      }
  
      // Update the partner card in the database
      const updatedPartner = await Partner.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedPartner) {
        return res.status(404).send({ error: 'Partner card not found.' });
      }
  
      res.status(200).send(updatedPartner); // Send the updated partner card
    } catch (err) {
      res.status(500).send({ error: 'Error updating partner card.' });
    }
  };
  
// Delete a partner card
exports.deletePartner = async function (req, res) {
  try {
    const { id } = req.params;

    const partner = await Partner.findByIdAndDelete(id);
    if (!partner) {
      return res.status(404).send({ error: 'Partner card not found.' });
    }

    // Delete the associated image from Azure Blob Storage
    if (partner.imageUrl) {
      await azureBlobService.deleteFromAzure(partner.imageUrl);
    }

    res.status(200).send({ message: 'Partner card deleted successfully.' });
  } catch (err) {
    res.status(500).send({ error: 'Error deleting partner card.' });
  }
};
