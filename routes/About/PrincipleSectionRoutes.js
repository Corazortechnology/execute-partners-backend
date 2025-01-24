const express = require('express');
const multer = require('multer');
const principleController = require('../../controllers/About/PrincipleSectionController');

const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

// Fetch all partner cards
router.get('/', principleController.getAllPrinciples);

// Create a new partner card
router.post('/', upload.single('image'), principleController.createPrinciple);

// Update an existing partner card
router.patch('/:id', upload.single('image'), principleController.updatePrinciple);

// Delete a partner card
router.delete('/:id', principleController.deletePrinciple);

module.exports = router;
