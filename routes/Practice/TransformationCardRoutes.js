const express = require('express');
const multer = require('multer');
const transformationCardController = require('../../controllers/Practice/TransformationCardController');

const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

// Fetch the transformation card
router.get('/', transformationCardController.getTransformationCard);

// Create or update the transformation card
router.post('/', upload.single('image'), transformationCardController.upsertTransformationCard);

// Delete the transformation card
router.delete('/', transformationCardController.deleteTransformationCard);

module.exports = router;
