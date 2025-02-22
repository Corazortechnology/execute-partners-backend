const Document = require("../../models/Documents/document");
const azureBlobService = require("../../services/azureBlobService");

// Create a new document
exports.uploadDocument = async (req, res) => {
  try {
    const { title, userId } = req.body;

    // Validate inputs
    if (!title || !userId) {
      return res
        .status(400)
        .json({ message: "Title and userId are required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No document file uploaded." });
    }

    // Upload to Azure Blob Storage
    const documentUrl = await azureBlobService.uploadToAzure(
      req.file.buffer,
      req.file.originalname
    );

    // Check if a document already exists with the same title for the user
    let document = await Document.findOne({ title, userId });

    if (document) {
      document.documentUrl = documentUrl; // Update existing document URL
    } else {
      document = new Document({ title, documentUrl, userId }); // Create new document entry
    }

    await document.save();

    res.status(201).json({
      message: "Document uploaded successfully.",
      data: document,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get all documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get documents by user ID
exports.getDocumentsByUserId = async (req, res) => {
  try {
    
    const { userId } = req.params;
    const documents = await Document.find({ userId }).sort({ createdAt: -1 });

    if (!documents.length) {
      return res
        .status(404)
        .json({ message: "No documents found for this user." });
    }

    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents by user ID:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a single document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.status(200).json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update a document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, documentUrl, userId } = req.body;

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { title, documentUrl, userId },
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDocument = await Document.findByIdAndDelete(id);

    if (!deletedDocument) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.status(200).json({ message: "Document deleted successfully." });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
