import { NextApiRequest, NextApiResponse } from "next";
import catchAsync from "../utils/catchAsync";
const authController = require("../controllers/authController")
import User from "../models/userModels";
import AppError from "../utils/appError";

exports.getMe = catchAsync(
    async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
      const userID = await authController.getLoginUserID(req, res, next);
  
      const user = await User.findById(userID).select("-password");
      if (!user) {
        return next(new AppError("User not found", 404));
      }
      res.status(200).json({
        status: "success",
        data: {
          user,
        },
      });
    }
  );