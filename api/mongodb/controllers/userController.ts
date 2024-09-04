import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";

import User from "../models/userModels";
import AppError from "../utils/appError";

export const getMe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("User ID not found", 401);
    }
    if (!user?.active) {
      res
        .status(404)
        .json({ message: "Account has been Deacivated", data: null });
    }

    res.status(200).json({
      status: "success",
      data: {
        user
      }
    });
  }
);

export const updateMe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      const user = await User.create(req.body)
    }
    const user = await User.findOneAndUpdate({ email }, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      throw new AppError("User ID not found", 401);
    }
    res.status(200).json({ messsage: "Success Updated", data: user });
  }
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { active: false },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new AppError("User ID not found", 401);
    }
    res.status(200).json({ messsage: "Account Deacivated", data: null });
    return;
  }
);
