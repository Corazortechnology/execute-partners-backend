const Insight = require("../../models/Insight/Insight");
const azureBlobService = require("../../services/azureBlobService");

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

// Get a specific Insight by ID
exports.getInsight = async (req, res) => {
  const { id } = req.params;
  try {
    const insight = await Insight.findOne({ "cards._id": id }, { "cards.$": 1 });

    if (!insight) {
      return res.status(404).json({ message: "Insight data not found." });
    }

    res.status(200).json({
      message: "Insight data retrieved successfully",
      data: insight.cards[0], // Return only the matched card
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
      {},
      { subheading },
      { new: true, upsert: true }
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
    const { heading, description, dateTime, readDuration, category, content } = req.body;
    const image = req.file;

    // Upload image if provided
    let imageUrl = null;
    if (image) {
      imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);
    }

    let insights = await Insight.findOne();
    if (!insights) {
      insights = new Insight({ cards: [] });
    }

    const newCard = {
      heading,
      description,
      dateTime,
      readDuration,
      imageUrl,
      category,
      content: content || [],
    };

    insights.cards.push(newCard);
    await insights.save();

    res.status(201).json({
      message: "Card added successfully",
      data: insights.cards[insights.cards.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding card", error });
  }
};

// Update a specific card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description, dateTime, readDuration, category, content } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = await azureBlobService.uploadToAzure(req.file.buffer, req.file.originalname);
    }

    const insights = await Insight.findOne();
    if (!insights) {
      return res.status(404).json({ message: "Insights data not found." });
    }

    const card = insights.cards.id(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    if (heading) card.heading = heading;
    if (description) card.description = description;
    if (dateTime) card.dateTime = dateTime;
    if (readDuration) card.readDuration = readDuration;
    if (category) card.category = category;
    if (imageUrl) card.imageUrl = imageUrl;

    if (content) {
      card.content = content;
    }

    await insights.save();

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
    const { id } = req.params;

    const insights = await Insight.findOne();
    if (!insights) {
      return res.status(404).json({ message: "Insights data not found." });
    }

    const cardIndex = insights.cards.findIndex((card) => card._id.toString() === id);
    if (cardIndex === -1) {
      return res.status(404).json({ message: "Card not found." });
    }

    insights.cards.splice(cardIndex, 1);
    await insights.save();

    res.status(200).json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting card", error });
  }
};

// Add content to a specific card
exports.addContentToCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description } = req.body;

    console.log("Received Heading:", heading);
    console.log("Received Description:", description);

    const insights = await Insight.findOne();
    if (!insights) {
      return res.status(404).json({ message: "Insights data not found." });
    }

    const card = insights.cards.id(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    console.log("Card Found:", card);

    let imageUrl = null;
    let videoUrl = null;

    // Check if image is uploaded
    if (req.files && req.files.image) {
      console.log("Uploading Image:", req.files.image[0].buffer);
      imageUrl = await azureBlobService.uploadToAzure(
        req.files.image[0].buffer,
        req.files.image[0].originalname
      );
    }

    // Check if video is uploaded
    if (req.files && req.files.video) {
      console.log("Uploading Video:", req.files);
      videoUrl = await azureBlobService.uploadToAzure(
        req.files.video[0].buffer,
        req.files.video[0].originalname
      );
    }

    console.log("Uploaded Image URL:", imageUrl);
    console.log("Uploaded Video URL:", videoUrl);

    // Push new content
    const newContent = { heading, description, imageUrl, videoUrl };
    card.content.push(newContent);
    await insights.save();

    res.status(201).json({
      message: "Content added successfully",
      data: newContent,
    });
  } catch (error) {
    console.error("Error adding content:", error);
    res.status(500).json({ message: "Error adding content", error });
  }
};


// Update content inside a specific card
exports.updateContentInCard = async (req, res) => {
  try {
    const { cardId, contentId } = req.params;
    const { heading, description } = req.body;

    const insights = await Insight.findOne();
    if (!insights) {
      return res.status(404).json({ message: "Insights data not found." });
    }

    const card = insights.cards.id(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    const contentItem = card.content.id(contentId);
    if (!contentItem) {
      return res.status(404).json({ message: "Content item not found." });
    }

    let imageUrl = contentItem.imageUrl;
    let videoUrl = contentItem.videoUrl;

    // Check if image is uploaded
    if (req.files && req.files.image) {
      console.log("Uploading Image:", req.files.image[0].buffer);
      imageUrl = await azureBlobService.uploadToAzure(
        req.files.image[0].buffer,
        req.files.image[0].originalname
      );
    }

    // Check if video is uploaded
    if (req.files && req.files.video) {
      console.log("Uploading Video:", req.files);
      videoUrl = await azureBlobService.uploadToAzure(
        req.files.video[0].buffer,
        req.files.video[0].originalname
      );
    }

    contentItem.heading = heading || contentItem.heading;
    contentItem.description = description || contentItem.description;
    contentItem.imageUrl = imageUrl;
    contentItem.videoUrl = videoUrl;

    await insights.save();

    res.status(200).json({
      message: "Content updated successfully",
      data: contentItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating content", error });
  }
};
// Delete a specific content item from a card
exports.deleteContentFromCard = async (req, res) => {
  try {
    const { cardId, contentId } = req.params;

    const insights = await Insight.findOne();
    if (!insights) {
      return res.status(404).json({ message: "Insights data not found." });
    }

    const card = insights.cards.id(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    const contentIndex = card.content.findIndex((c) => c._id.toString() === contentId);
    if (contentIndex === -1) {
      return res.status(404).json({ message: "Content item not found." });
    }

    // Remove content item
    card.content.splice(contentIndex, 1);
    await insights.save();

    res.status(200).json({
      message: "Content removed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error removing content", error });
  }
};