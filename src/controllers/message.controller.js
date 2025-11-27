import messageModel from "../models/messageModel.js";
import conversationModel from "../models/conversationModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !message) {
    throw new ApiError(400, "Receiver ID and message are required");
  }

  // Find or create conversation
  let conversation = await conversationModel.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await conversationModel.create({
      participants: [senderId, receiverId],
      lastMessage: message,
    });
  } else {
    conversation.lastMessage = message;
    await conversation.save();
  }

  // Create message
  const newMessage = await messageModel.create({
    conversationId: conversation._id,
    sender: senderId,
    receiver: receiverId,
    message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Message sent successfully", newMessage));
});

const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  // Find conversation
  const conversation = await conversationModel.findOne({
    participants: { $all: [currentUserId, userId] },
  });

  if (!conversation) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No messages found", []));
  }

  // Get messages
  const messages = await messageModel
    .find({ conversationId: conversation._id })
    .populate("sender", "username email")
    .populate("receiver", "username email")
    .sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Messages fetched successfully", messages));
});

const getAllConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await conversationModel
    .find({
      participants: userId,
    })
    .populate("participants", "username email isOnline")
    .sort({ updatedAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Conversations fetched successfully", conversations)
    );
});

export { sendMessage, getMessages, getAllConversations };

