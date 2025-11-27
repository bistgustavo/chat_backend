import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import userModel from "../models/userModel.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized - No token provided");
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new ApiError(401, "Unauthorized - Invalid token");
  }

  const user = await userModel.findById(decoded.userId).select("-password");

  if (!user) {
    throw new ApiError(401, "Unauthorized - User not found");
  }

  req.user = user;
  next();
});

