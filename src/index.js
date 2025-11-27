import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "./utils/jwt.js";
import userModel from "./models/userModel.js";
import messageModel from "./models/messageModel.js";
import conversationModel from "./models/conversationModel.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store online users
const onlineUsers = new Map(); // userId -> socketId

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error("Invalid token"));
    }

    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = user._id.toString();
    socket.username = user.username;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection handler
io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.username} (${socket.userId})`);

  // Add user to online users
  onlineUsers.set(socket.userId, socket.id);

  // Update user online status
  await userModel.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    socketId: socket.id,
  });

  // Emit online users list to all clients
  const onlineUsersList = Array.from(onlineUsers.keys());
  io.emit("onlineUsers", onlineUsersList);

  // Emit user joined event
  socket.broadcast.emit("userJoined", {
    userId: socket.userId,
    username: socket.username,
  });

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    try {
      const { receiverId, message } = data;

      // Find or create conversation
      let conversation = await conversationModel.findOne({
        participants: { $all: [socket.userId, receiverId] },
      });

      if (!conversation) {
        conversation = await conversationModel.create({
          participants: [socket.userId, receiverId],
          lastMessage: message,
        });
      } else {
        conversation.lastMessage = message;
        await conversation.save();
      }

      // Save message to database
      const newMessage = await messageModel.create({
        conversationId: conversation._id,
        sender: socket.userId,
        receiver: receiverId,
        message,
      });

      const populatedMessage = await messageModel
        .findById(newMessage._id)
        .populate("sender", "username email")
        .populate("receiver", "username email");

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage);
      }

      // Send back to sender
      socket.emit("messageSent", populatedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { receiverId } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        userId: socket.userId,
        username: socket.username,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.username} (${socket.userId})`);

    // Remove from online users
    onlineUsers.delete(socket.userId);

    // Update user online status
    await userModel.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      socketId: "",
    });

    // Emit updated online users list
    const onlineUsersList = Array.from(onlineUsers.keys());
    io.emit("onlineUsers", onlineUsersList);

    // Emit user left event
    socket.broadcast.emit("userLeft", {
      userId: socket.userId,
      username: socket.username,
    });
  });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`App is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });
