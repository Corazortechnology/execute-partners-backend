const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/Chats/Chat");

// Route to get the chat history between two users 
router.get('/history/:user1Id/:user2Id', chatController.getChatHistory);

router.get('/inbox/:userId', chatController.getInboxSummary);

router.get('/markRead', chatController.markMessagesRead);

module.exports = router;