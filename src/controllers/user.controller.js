import userModel from "../models/userModel.js";
import messageModel from "../models/messageModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validate input
  if (!email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check existing user
  const userExists = await userModel.findOne({ email });
  if (userExists) {
    throw new ApiError(409, "User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = await userModel.create({
    email,
    username,
    password: hashedPassword,
  });

  // Generate token
  const token = generateToken({ userId: newUser._id });

  // Response
  return res
    .status(201)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })
    .json(
      new ApiResponse(201, "User registered successfully", {
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
        },
        token,
      })
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user
  const user = await userModel.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate token
  const token = generateToken({ userId: user._id });

  // Response
  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(200, "Login successful", {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
        token,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("token")
    .json(new ApiResponse(200, "Logout successful", {}));
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.find().select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", users));
});

const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await userModel.countDocuments();
  const activeUsers = await userModel.countDocuments({ isOnline: true });
  const totalMessages = await messageModel.countDocuments();

  return res.status(200).json(
    new ApiResponse(200, "Stats fetched successfully", {
      totalUsers,
      activeUsers,
      totalMessages,
    })
  );
});

export { registerUser, loginUser, logoutUser, getUsers, getStats };
