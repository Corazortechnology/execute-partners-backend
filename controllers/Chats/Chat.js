const Chat = require("../../models/Chats/Chat");
const User = require("../../models/Auth/User");

// Controller to get the chat history between two users
const getChatHistory = async (req, res) => {
  const { user1Id, user2Id } = req.params;

  try {
    const chatHistory = await Chat.find({
        $or: [
            { sender: user1Id, receiver: user2Id},
            { sender: user2Id, receiver: user1Id},
        ],
    }).sort({ timestamp: 1 }) 

    res.status(200).json({ chatHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching chat history"});
  }
};

// Get inbox summary for a user
const getInboxSummary = async (req, res) => {
  const { userId } = req.params;

  try {
    // Aggregate inbox: last message from each conversation partner
    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender"
            ],
          },
          lastMessage: { $first: "$message" },
          timestamp: { $first: "$timestamp" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiver", userId] },
                  { $eq: ["$isRead", false] }
                ] },
                1,
                0
              ]
            }
          }
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        },
      },
      {
        $unwind: "$userInfo"
      },
      {
        $project: {
          userId: "$_id",
          lastMessage: 1,
          timestamp: 1,
          unreadCount: 1,
          name: "$userInfo.username",
          profile: "$userInfo.profile"
        }
      }
    ]);

    res.status(200).json({ inbox: conversations });
  } catch (error) {
    console.error("Error fetching inbox summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark all messages as read from sender to receiver
const markMessagesRead = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    await Chat.updateMany(
      { sender: senderId, receiver: receiverId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Messages marked as read." });
  } catch (error) {
    console.error("Error marking messages read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get unread count for specific conversation
const getUnreadCount = async (req, res) => {
  const { userId, partnerId } = req.params;

  try {
    const count = await Chat.countDocuments({
      sender: partnerId,
      receiver: userId,
      isRead: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};

// Export
module.exports = {
  getChatHistory,
  getInboxSummary,
  markMessagesRead,
  getUnreadCount
};

