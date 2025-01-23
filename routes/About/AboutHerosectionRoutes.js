const express = require('express');
const aboutController = require('../../controllers/About/AboutHeroSectionController');

const router = express.Router();

// Route to get "About Us" data
router.get('/', aboutController.getAbout);

// Route to create "About Us" data
router.post('/', aboutController.createAbout);

// Route to update "About Us" data
router.patch('/', aboutController.updateAbout);

module.exports = router;
