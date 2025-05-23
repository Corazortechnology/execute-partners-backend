
// Get all contact data (subheading + cards)
const contactUs = require("../../models/Contact Us/ContactUs");

exports.getContactData = async (req, res) => {
  try {
    let contactData = await contactUs.findOne();

    // If no data exists, create a default document
    if (!contactData) {
      contactData = new contactUs({
        subheading: {
          infoEmail: "info@example.com",
          hrEmail: "hr@example.com",
          officeAddress: "Default Office Address",
          description: "Default description about the company",
        },
        cards: [],
      });

      await contactData.save();
    }

    res.status(200).json({
      message: "Contact data retrieved successfully",
      data: contactData,
    });
  } catch (error) {
    console.error("Error retrieving contact data:", error);
    res.status(500).json({ message: "Error retrieving contact data", error });
  }
};


// Update the subheading with multiple fields
exports.updateSubheading = async (req, res) => {
  try {
    const { infoEmail, hrEmail, officeAddress, description } = req.body;

    const contact = await contactUs.findOneAndUpdate(
      {},
      { subheading: { infoEmail, hrEmail, officeAddress, description } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Subheading updated successfully", data: contact });
  } catch (error) {
    res.status(500).json({ message: "Error updating subheading", error });
  }
};

// Add a new card
exports.addCard = async (req, res) => {
  try {
    const { heading, description } = req.body;

    let contact = await contactUs.findOne();
    if (!contact) {
      contact = new contactUs({ cards: [] }); // Initialize cards array if it doesn't exist
    }

    contact.cards.push({ heading, description });

    await contact.save();

    res.status(201).json({
      message: "Card added successfully",
      data: contact.cards[contact.cards.length - 1], // Return the newly added card
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding card", error });
  }
};

// Update a specific card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params; // Retrieve card ID from params
    const { heading, description } = req.body;

    const contact = await contactUs.findOne();
    if (!contact) {
      return res.status(404).json({ message: "Contact data not found." });
    }

    const card = contact.cards.id(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Update card fields
    card.heading = heading || card.heading;
    card.description = description || card.description;

    await contact.save();

    res.status(200).json({
      message: "Card updated successfully",
      data: card,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating card", error });
  }
};

// Delete a specific card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params; // Retrieve card ID from params

    const contact = await contactUs.findOne();
    if (!contact) {
      return res.status(404).json({ message: "Contact data not found." });
    }

    // Find the card by ID and delete it using the `delete` method
    const cardIndex = contact.cards.findIndex(
      (card) => card._id.toString() === id
    );
    if (cardIndex === -1) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Remove the card from the array
    contact.cards.splice(cardIndex, 1);

    await contact.save(); // Save the changes to the database

    res.status(200).json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting card", error });
  }
};
