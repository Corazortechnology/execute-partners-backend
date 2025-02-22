const express = require("express");
const router = express.Router();
const multer = require("multer");
const documentController = require("../../controllers/Document/document");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes for Document CRUD operations
router.post(
  "/upload",
  upload.single("document"),
  documentController.uploadDocument
);
router.get("/", documentController.getAllDocuments); // Read all
// router.get("/:id", documentController.getDocumentById);
router.get("/:userId", documentController.getDocumentsByUserId); // Read one
router.put("/:id", documentController.updateDocument); 
router.delete("/:id", documentController.deleteDocument); // Delete

module.exports = router;
