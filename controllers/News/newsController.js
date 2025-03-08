
const News = require("../../models/News/news");
const azureBlobService = require("../../services/azureBlobService");

// Get all news data (subheading + cards)
exports.getAllNews = async (req, res) => {
    try {
        const news = await News.findOne();
        if (!news) {
            return res.status(404).json({ message: "News data not found." });
        }
        res.status(200).json({
            message: "news data retrieved successfully",
            data: news,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving news data", error });
    }
};

// Get a specific news by ID
exports.getNews = async (req, res) => {
    const { id } = req.params;
    try {
        const news = await News.findOne({ "cards._id": id }, { "cards.$": 1 });

        if (!news) {
            return res.status(404).json({ message: "news data not found." });
        }

        res.status(200).json({
            message: "News data retrieved successfully",
            data: news.cards[0], // Return only the matched card
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving news data", error });
    }
};

// Update the subheading
exports.updateSubheading = async (req, res) => {
    try {
        const { subheading } = req.body;

        const news = await News.findOneAndUpdate(
            {},
            { subheading },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: "Subheading updated successfully",
            data: news,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating subheading", error });
    }
};

// Add a new card
// Add a new card
exports.addCard = async (req, res) => {
    try {
        const { heading, description, dateTime, readDuration, category, content, references, socialLinks, headingLinks, descriptionLinks } = req.body;
        const image = req.file;


        // Upload image if provided
        let imageUrl = null;
        if (image) {
            console.log("Uploading Image:", image.originalname);
            imageUrl = await azureBlobService.uploadToAzure(image.buffer, image.originalname);
        }

        // Find or create news document
        let news = await News.findOne();
        if (!news) {
            news = new News({ cards: [] });
        }

        // ✅ Parse references (Ensure array format)
        const parsedReferences = references
            ? typeof references === "string"
                ? JSON.parse(references)
                : references.map(ref => ({ title: ref.title || "", url: ref.url || "" }))
            : [];

        // ✅ Parse social links
        const parsedSocialLinks = socialLinks
            ? typeof socialLinks === "string"
                ? JSON.parse(socialLinks)
                : socialLinks.map(link => ({ text: link.text || "", url: link.url || "" }))
            : [];

        // ✅ Parse heading links
        const parsedHeadingLinks = headingLinks
            ? typeof headingLinks === "string"
                ? JSON.parse(headingLinks)
                : headingLinks.map(link => ({ text: link.text || "", url: link.url || "" }))
            : [];

        // ✅ Parse description links
        const parsedDescriptionLinks = descriptionLinks
            ? typeof descriptionLinks === "string"
                ? JSON.parse(descriptionLinks)
                : descriptionLinks.map(link => ({ text: link.text || "", url: link.url || "" }))
            : [];
        console.log(parsedDescriptionLinks)
        // ✅ Parse content (Ensure proper structure)
        const parsedContent = content
            ? typeof content === "string"
                ? JSON.parse(content)
                : content.map(item => ({
                    type: item.type || "paragraph",
                    heading: item.heading || "",
                    headingLinks: Array.isArray(item.headingLinks) ? item.headingLinks : [],
                    description: item.description || "",
                    descriptionLinks: Array.isArray(item.descriptionLinks) ? item.descriptionLinks : [],
                    listItems: Array.isArray(item.listItems)
                        ? item.listItems.map(listItem => ({
                            heading: listItem.heading || "",
                            headingLinks: Array.isArray(listItem.headingLinks) ? listItem.headingLinks : [],
                            description: listItem.description || "",
                            descriptionLinks: Array.isArray(listItem.descriptionLinks) ? listItem.descriptionLinks : [],
                            items: Array.isArray(listItem.items) ? listItem.items : [],
                            itemLinks: Array.isArray(listItem.itemLinks) ? listItem.itemLinks : [],
                        }))
                        : [],
                }))
            : [];

        // Construct new card object
        const newCard = {
            heading,
            headingLinks: parsedHeadingLinks,
            description,
            descriptionLinks: parsedDescriptionLinks,
            dateTime,
            readDuration,
            category: category || "Uncategorized",
            imageUrl,
            references: parsedReferences,
            socialLinks: parsedSocialLinks,
            content: parsedContent,
        };

        // Add card to news and save
        news.cards.push(newCard);
        await news.save();

        res.status(201).json({
            message: "Card added successfully",
            data: news.cards[news.cards.length - 1],
        });

    } catch (error) {
        console.error("Error adding card:", error);
        res.status(500).json({ message: "Error adding card", error });
    }
};

// Add content to a specific card
exports.addContentToCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, heading, description, headingLinks, descriptionLinks, listItems } = req.body;

        // console.log("Received Data:", { type, heading, description, headingLinks, descriptionLinks, listItems });

        // Find the news
        const news = await News.findOne();
        if (!news) {
            return res.status(404).json({ message: "News data not found." });
        }

        // Find the card by ID
        const card = news.cards.id(id);
        if (!card) {
            return res.status(404).json({ message: "Card not found." });
        }

        // console.log("Card Found:", card);

        let imageUrl = null;
        let videoUrl = null;

    
        // Check if image is uploaded
        if (req.files && req.files.image) {
            imageUrl = await azureBlobService.uploadToAzure(
                req.files.image[0].buffer,
                req.files.image[0].originalname
            );
        }

        // Check if video is uploaded
        if (req.files && req.files.video) {
            videoUrl = await azureBlobService.uploadToAzure(
                req.files.video[0].buffer,
                req.files.video[0].originalname
            );
        }

    

        // Parse heading links
        const parsedHeadingLinks = headingLinks
        const parsedDescriptionLinks = descriptionLinks

        // Parse list items
        const parsedListItems = listItems?.map((listItem) => ({
            heading: listItem.heading || "",
            headingLinks: listItem.headingLinks || [],
            description: listItem.description || "",
            descriptionLinks: listItem.descriptionLinks || [],
            items: listItem.items || [],
            itemLinks: listItem.itemLinks || [],
        }));

        // Construct new content object
        const newContent = {
            type: type || "paragraph",
            heading,
            headingLinks: parsedHeadingLinks,
            description,
            descriptionLinks: parsedDescriptionLinks,
            listItems: parsedListItems || [],
            imageUrl,
            videoUrl,
        };

        // Push new content to the card
        card.content.push(newContent);
        await news.save();

        res.status(201).json({
            message: "Content added successfully",
            data: newContent,
        });

    } catch (error) {
        console.error("Error adding content:", error);
        res.status(500).json({ message: "Error adding content", error });
    }
};

// Update a specific card
// Update a specific card
exports.updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { heading, description, dateTime, readDuration, category, content, references, socialLinks, headingLinks, descriptionLinks } = req.body;
        let imageUrl = null;

        // ✅ Upload image if provided
        if (req.file) {
            imageUrl = await azureBlobService.uploadToAzure(req.file.buffer, req.file.originalname);
        }

        // ✅ Find the news document
        const news = await News.findOne();
        if (!news) {
            return res.status(404).json({ message: "News data not found." });
        }

        // ✅ Find the card by ID
        const card = news.cards.id(id);
        if (!card) {
            return res.status(404).json({ message: "Card not found." });
        }

        // ✅ Update fields if provided
        if (heading) card.heading = heading;
        if (description) card.description = description;
        if (dateTime) card.dateTime = dateTime;
        if (readDuration) card.readDuration = readDuration;
        if (category) card.category = category;
        if (imageUrl) card.imageUrl = imageUrl;

        // ✅ Update references
        if (references) {
            card.references = typeof references === "string"
                ? JSON.parse(references)
                : references.map(ref => ({ title: ref.title || "", url: ref.url || "" }));
        }

        // ✅ Update social links
        if (socialLinks) {
            card.socialLinks = typeof socialLinks === "string"
                ? JSON.parse(socialLinks)
                : socialLinks.map(link => ({ text: link.text || "", url: link.url || "" }));
        }

        // ✅ Update heading links
        if (headingLinks) {
            card.headingLinks = typeof headingLinks === "string"
                ? JSON.parse(headingLinks)
                : headingLinks.map(link => ({ text: link.text || "", url: link.url || "" }));
        }

        // ✅ Update description links
        if (descriptionLinks) {
            card.descriptionLinks = typeof descriptionLinks === "string"
                ? JSON.parse(descriptionLinks)
                : descriptionLinks.map(link => ({ text: link.text || "", url: link.url || "" }));
        }

        // ✅ Update content
        if (content) {
            card.content = typeof content === "string"
                ? JSON.parse(content)
                : content.map(item => ({
                    type: item.type || "paragraph",
                    heading: item.heading || "",
                    headingLinks: Array.isArray(item.headingLinks) ? item.headingLinks : [],
                    description: item.description || "",
                    descriptionLinks: Array.isArray(item.descriptionLinks) ? item.descriptionLinks : [],
                    listItems: Array.isArray(item.listItems)
                        ? item.listItems.map(listItem => ({
                            heading: listItem.heading || "",
                            headingLinks: Array.isArray(listItem.headingLinks) ? listItem.headingLinks : [],
                            description: listItem.description || "",
                            descriptionLinks: Array.isArray(listItem.descriptionLinks) ? listItem.descriptionLinks : [],
                            items: Array.isArray(listItem.items) ? listItem.items : [],
                            itemLinks: Array.isArray(listItem.itemLinks) ? listItem.itemLinks : [],
                        }))
                        : [],
                }));
        }

        // ✅ Save the updated document
        await news.save();

        res.status(200).json({
            message: "Card updated successfully",
            data: card,
        });

    } catch (error) {
        console.error("Error updating card:", error);
        res.status(500).json({ message: "Error updating card", error });
    }
};

// Update content inside a specific card
exports.updateContentInCard = async (req, res) => {
    try {
        const { cardId, contentId } = req.params;
        const { type, heading, headingLinks, description, descriptionLinks, listItems } = req.body;

    

        // Find News
        const news = await News.findOne();
        if (!news) {
            return res.status(404).json({ message: "News data not found." });
        }

        // Find the specific Card
        const card = news.cards.id(cardId);
        if (!card) {
            return res.status(404).json({ message: "Card not found." });
        }

        // Find the specific Content
        const contentItem = card.content.id(contentId);
        if (!contentItem) {
            return res.status(404).json({ message: "Content item not found." });
        }

        let imageUrl = contentItem.imageUrl;
        let videoUrl = contentItem.videoUrl;

        // ✅ Upload New Image if Provided
        if (req.files && req.files.image) {
            imageUrl = await azureBlobService.uploadToAzure(
                req.files.image[0].buffer,
                req.files.image[0].originalname
            );
        }

        // ✅ Upload New Video if Provided
        if (req.files && req.files.video) {
            videoUrl = await azureBlobService.uploadToAzure(
                req.files.video[0].buffer,
                req.files.video[0].originalname
            );
        }

        // ✅ Parse Heading Links
        const parsedHeadingLinks = headingLinks
            ? Array.isArray(headingLinks)
                ? headingLinks
                : JSON.parse(headingLinks) // If sent as JSON string, parse it
            : [];

        // ✅ Parse Description Links
        const parsedDescriptionLinks = descriptionLinks
            ? Array.isArray(descriptionLinks)
                ? descriptionLinks
                : JSON.parse(descriptionLinks)
            : [];

        // ✅ Parse List Items
        const parsedListItems = listItems
            ? Array.isArray(listItems)
                ? listItems.map((listItem) => ({
                    heading: listItem.heading || "",
                    headingLinks: Array.isArray(listItem.headingLinks) ? listItem.headingLinks : [],
                    description: listItem.description || "",
                    descriptionLinks: Array.isArray(listItem.descriptionLinks) ? listItem.descriptionLinks : [],
                    items: Array.isArray(listItem.items) ? listItem.items : [],
                    itemLinks: Array.isArray(listItem.itemLinks) ? listItem.itemLinks : [],
                }))
                : JSON.parse(listItems)
            : [];

        // ✅ Update the Content Item
        contentItem.type = type || contentItem.type;
        contentItem.heading = heading || contentItem.heading;
        contentItem.headingLinks = parsedHeadingLinks;
        contentItem.description = description || contentItem.description;
        contentItem.descriptionLinks = parsedDescriptionLinks;
        contentItem.listItems = parsedListItems;
        contentItem.imageUrl = imageUrl;
        contentItem.videoUrl = videoUrl;

        // ✅ Save Updates
        await news.save();

        res.status(200).json({
            message: "Content updated successfully",
            data: contentItem,
        });

    } catch (error) {
        console.error("Error updating content:", error);
        res.status(500).json({ message: "Error updating content", error });
    }
};

// Delete a specific content item from a card
exports.deleteContentFromCard = async (req, res) => {
    try {
        const { cardId, contentId } = req.params;

        const news = await News.findOne();
        if (!news) {
            return res.status(404).json({ message: "News data not found." });
        }

        const card = news.cards.id(cardId);
        if (!card) {
            return res.status(404).json({ message: "Card not found." });
        }

        const contentIndex = card.content.findIndex((c) => c._id.toString() === contentId);
        if (contentIndex === -1) {
            return res.status(404).json({ message: "Content item not found." });
        }

        // Remove content item
        card.content.splice(contentIndex, 1);
        await news.save();

        res.status(200).json({
            message: "Content removed successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Error removing content", error });
    }
};

// Delete a specific card
exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;

        const news = await News.findOne();
        if (!news) {
            return res.status(404).json({ message: "News data not found." });
        }

        const cardIndex = news.cards.findIndex((card) => card._id.toString() === id);
        if (cardIndex === -1) {
            return res.status(404).json({ message: "Card not found." });
        }

        news.cards.splice(cardIndex, 1);
        await news.save();

        res.status(200).json({
            message: "Card deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting card", error });
    }
};