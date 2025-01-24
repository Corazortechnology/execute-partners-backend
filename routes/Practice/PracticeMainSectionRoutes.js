const express = require('express');
const multer = require('multer');
const practiceCardController = require('../../controllers/Practice/PracticeMainSectionController');

const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

// Fetch all practice cards
router.get('/', practiceCardController.getAllPracticeCards);

// Create a new practice card
router.post('/', upload.single('image'), practiceCardController.createPracticeCard);

// Update an existing practice card
router.patch('/:id', upload.single('image'), practiceCardController.updatePracticeCard);

// Delete a practice card
router.delete('/:id', practiceCardController.deletePracticeCard);

module.exports = router;
