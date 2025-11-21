import userModel from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
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

  // Response
  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
    })
  );
});

export { registerUser };
