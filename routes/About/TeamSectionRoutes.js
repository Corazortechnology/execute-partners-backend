const express = require('express');
const multer = require('multer');
const teamAdvisorController = require('../../controllers/About/TeamSectionController');

const router = express.Router();
const upload = multer(); 

// Fetch all team advisor cards
router.get('/', teamAdvisorController.getAllTeamAdvisors);

// Create a new team advisor card
router.post('/', upload.single('image'), teamAdvisorController.createTeamAdvisor);

// Update an existing team advisor card
router.patch('/:id', upload.single('image'), teamAdvisorController.updateTeamAdvisor);

// Delete a team advisor card
router.delete('/:id', teamAdvisorController.deleteTeamAdvisor);

module.exports = router;
