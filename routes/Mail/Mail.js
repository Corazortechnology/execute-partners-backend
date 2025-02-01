const express = require("express");
const router = express.Router();
const emailController = require("../../controllers/Mail/MailController");

// Email Routes
router.post("/send", emailController.sendEmail);
router.get("/", emailController.getAllEmails);
router.get("/:id", emailController.getEmailById);
router.put("/:id", emailController.updateEmail);
router.delete("/:id", emailController.deleteEmail);

module.exports = router;
