const express = require('express');
const keyPillarsController = require('../../controllers/About/KeyPillarSectionController');

const router = express.Router();

// Route to fetch Key Pillars data
router.get('/', keyPillarsController.getKeyPillars);

// Route to create or update Key Pillars data (Full Update)
router.post('/', keyPillarsController.upsertKeyPillars);

// Route to update Key Pillars data (Partial Update)
router.patch('/', keyPillarsController.updateKeyPillars);

module.exports = router;
