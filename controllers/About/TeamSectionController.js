const TeamAdvisor = require('../../models/About/TeamSectionModel');
const azureBlobService = require('../../services/azureBlobService');

// Fetch all team advisor cards
exports.getAllTeamAdvisors = async function (req, res) {
  try {
    const teamAdvisors = await TeamAdvisor.find({});
    res.status(200).send(teamAdvisors);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching team advisor cards.' });
  }
};

// Create a new team advisor card
exports.createTeamAdvisor = async function (req, res) {
  try {
    const { title, name, description } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).send({ error: 'Image file is required.' });
    }

    // Upload image to Azure Blob Storage
    const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);

    // Create a new card
    const teamAdvisor = new TeamAdvisor({
      title,
      name,
      description,
      imageUrl
    });

    const savedAdvisor = await teamAdvisor.save();
    res.status(201).send(savedAdvisor);
  } catch (err) {
    res.status(500).send({ error: 'Error creating team advisor card.' });
  }
};

// Update a specific team advisor card
exports.updateTeamAdvisor = async function (req, res) {
    try {
      const { id } = req.params; // Get ID from URL parameters
      const { title, name, description } = req.body;
      const image = req.file;
  
      let updateData = { title, name, description };
  
      if (image) {
        // Upload the new image to Azure Blob Storage
        const imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);
  
        // Find the existing card to delete its old image
        const existingAdvisor = await TeamAdvisor.findById(id);
        if (existingAdvisor && existingAdvisor.imageUrl) {
          await azureBlobService.deleteFromAzure(existingAdvisor.imageUrl); // Delete old image
        }
  
        updateData.imageUrl = imageUrl;
      }
  
      const updatedAdvisor = await TeamAdvisor.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedAdvisor) {
        return res.status(404).send({ error: 'Team advisor card not found.' });
      }
  
      res.status(200).send(updatedAdvisor);
    } catch (err) {
      res.status(500).send({ error: 'Error updating team advisor card.' });
    }
};
  
// Delete a team advisor card
exports.deleteTeamAdvisor = async function (req, res) {
  try {
    const { id } = req.params;

    const advisor = await TeamAdvisor.findByIdAndDelete(id);
    if (!advisor) {
      return res.status(404).send({ error: 'Team advisor card not found.' });
    }

    // Delete the associated image from Azure Blob Storage
    if (advisor.imageUrl) {
      await azureBlobService.deleteFromAzure(advisor.imageUrl);
    }

    res.status(200).send({ message: 'Team advisor card deleted successfully.' });
  } catch (err) {
    res.status(500).send({ error: 'Error deleting team advisor card.' });
  }
};
