const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../model/User.js");
const Message = require("../model/Message.js");

function chatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded.userId || decoded._id;

      if (!userId || !mongoose.isValidObjectId(userId)) {
        return next(new Error("Invalid token"));
      }

      const user = await User.findById(userId).select("_id");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = String(user._id);
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const myRoom = `user:${socket.userId}`;
    socket.join(myRoom);

    socket.on("send_message", async (data, callback) => {
      const reply =
        typeof callback === "function" ? callback : () => {};

      try {
        const receiverId = data?.receiverId;
        const text = data?.text?.trim();

        if (
          !mongoose.isValidObjectId(receiverId) ||
          String(receiverId) === socket.userId
        ) {
          return reply({
            success: false,
            message: "Invalid receiver",
          });
        }

        if (!text || text.length > 5000) {
          return reply({
            success: false,
            message: "Message must be 1–5000 characters",
          });
        }

        const receiver = await User.findById(receiverId).select("_id");

        if (!receiver) {
          return reply({
            success: false,
            message: "Receiver not found",
          });
        }

        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          text,
        });

        const payload = {
          _id: String(message._id),
          sender: String(message.sender),
          receiver: String(message.receiver),
          text: message.text,
          createdAt: message.createdAt,
        };

        io.to(`user:${socket.userId}`)
          .to(`user:${String(receiver._id)}`)
          .emit("new_message", payload);

        reply({ success: true, message: payload });
      } catch (error) {
        console.error("Socket message error:", error);
        reply({
          success: false,
          message: "Unable to send message",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Chat user disconnected:", socket.userId);
    });
  });
}

module.exports = chatSocket;