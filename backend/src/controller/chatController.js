
const User = require("../model/User.js");
const Message = require("../model/Message.js");

// Get logged-in user and all other users
exports.getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const me = await User.findById(currentUserId).select(
      "_id Fullname Email"
    );

    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
    }).select("_id Fullname Email");

    res.json({
      me: {
        _id: me._id,
        Fullname: me.Fullname,
        Email: me.Email,
      },
      users,
    });
  } catch (error) {
    console.error("getChatUsers error:", error);
    res.status(500).json({ message: "Failed to load users" });
  }
};

// Get previous messages with selected user
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const otherUserId = req.params.userId;

    if (!otherUserId || !otherUserId.match(/^[a-f\d]{24}$/i)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (String(currentUserId) === String(otherUserId)) {
      return res.status(400).json({
        message: "You cannot open a chat with yourself",
      });
    }

    const otherUser = await User.findById(otherUserId).select("_id");

    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to load messages" });
  }
};
