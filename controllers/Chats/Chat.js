const Chat = require("../../models/Chats/Chat");

// Controller to get the chat history between two users
const getChatHistory = async (req, res) => {
  const { user1Id, user2Id } = req.params;

  try {
    const chatHistory = await Chat.find({
        $or: [
            { sender: user1Id, receiver: user2Id},
            { sender: user2Id, receiver: user1Id},
        ],
    }).sort({ timestamp: true }) // Sort by timestamp to get the chronological order of messages

    res.status(200).json({ chatHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching chat history"});
  }
};

module.exports = {
    getChatHistory
};
