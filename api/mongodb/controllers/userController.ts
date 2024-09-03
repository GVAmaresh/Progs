import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
const authController = require("../controllers/authController")
import User from "../models/userModels";
import AppError from "../utils/appError";

export const getMe = catchAsync(
  async (req: Request, res: Response):Promise<void> => {
    const userID = await authController.getLoginUserID(req, res);
    
    if (!userID) {
      throw new AppError("User ID not found", 401);
    }

    const user = await User.findById(userID).select("-password");
    
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);