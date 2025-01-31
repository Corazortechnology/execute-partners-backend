const Insight = require("../../models/Insight/Insight");

// Get all insights data (subheading + cards)
exports.getInsights = async (req, res) => {
  try {
    const insights = await Insight.findOne();
    if (!insights) {
      return res.status(404).json({ message: "Insights data not found." });
    }
    res.status(200).json({
      message: "Insights data retrieved successfully",
      data: insights,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving insights data", error });
  }
};

// Get Insight by ID
exports.getInsight = async (req, res) => {
  const { id } = req.params;
  try {
    const insight = await Insight.findById(id);

    if (!insight) {
      return res.status(404).json({ message: "Insight data not found." });
    }

    res.status(200).json({
      message: "Insight data retrieved successfully",
      data: insight,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Insight data", error });
  }
};

// Update the subheading
exports.updateSubheading = async (req, res) => {
  try {
    const { subheading } = req.body;

    const insights = await Insight.findOneAndUpdate(
      {}, // Match the first document
      { subheading },
      { new: true, upsert: true } // Create if it doesn't exist
    );

    res.status(200).json({
      message: "Subheading updated successfully",
      data: insights,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating subheading", error });
  }
};

// Add a new card
exports.addCard = async (req, res) => {
  try {
    const { heading, description, dateTime, readDuration } = req.body;
    const image = req.file;
    console.log(heading, description, dateTime, readDuration)
    // const imageUrl = await azureBlobService.uploadToAzure(
    //   image.buffer,
    //   image.originalname
    // );

    let insights = await Insight.findOne();
    if (!insights) {
      insights = new Insight({ cards: [] }); // Initialize cards array if it doesn't exist
    }

    insights.cards.push({
      heading,
      description,
      dateTime,
      readDuration,
      // imageUrl,
    });

    await insights.save();

    res.status(201).json({
      message: "Card added successfully",
      data: insights.cards[insights.cards.length - 1], // Return the newly added card
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding card", error });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params; // Get card ID from params
    const { heading, description, dateTime, readDuration } = req.body;

    // Handle file upload (Check if an image is provided)
    let imageUrl = null;
    if (req.file) {
      imageUrl = await azureBlobService.uploadToAzure(
        req.file.buffer, 
        req.file.originalname
      );
    }

    // Find the insights document
    const insights = await Insight.findOne();
    if (!insights) {
      return res.status(404).json({ message: "Insights data not found." });
    }

    // Find the specific card inside the `cards` array
    const card = insights.cards.id(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Update card fields (Only update if a new value is provided)
    card.heading = heading || card.heading;
    card.description = description || card.description;
    card.dateTime = dateTime || card.dateTime;
    card.readDuration = readDuration || card.readDuration;
    if (imageUrl) card.imageUrl = imageUrl; // Update image if provided

    // Save the updated document
    await insights.save();

    res.status(200).json({
      message: "Card updated successfully",
      data: card,
    });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ message: "Error updating card", error });
  }
};


// Delete a specific card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params; // Retrieve card ID from params

    const insights = await Insight.findOne();
    if (!insights) {
      return res.status(404).json({ message: "Insights data not found." });
    }

    // Find the card by ID and delete it using the `delete` method
    const cardIndex = insights.cards.findIndex(
      (card) => card._id.toString() === id
    );
    if (cardIndex === -1) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Remove the card from the array
    insights.cards.splice(cardIndex, 1);

    await insights.save(); // Save the changes to the database

    res.status(200).json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting card", error });
  }
};
