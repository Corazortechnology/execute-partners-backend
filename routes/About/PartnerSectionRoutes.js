const express = require('express');
const multer = require('multer');
const partnerController = require('../../controllers/About/PartnerSectionController');

const router = express.Router();
const upload = multer(); // Middleware for handling file uploads

// Fetch all partner cards
router.get('/', partnerController.getAllPartners);

// Create a new partner card
router.post('/', upload.single('image'), partnerController.createPartner);

// Update an existing partner card
router.patch('/:id', upload.single('image'), partnerController.updatePartner);

// Delete a partner card
router.delete('/:id', partnerController.deletePartner);

module.exports = router;
