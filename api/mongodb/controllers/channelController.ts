import { Request, Response } from "express";
import Channel from "../models/channelModal";
import catchAsync from "../utils/catchAsync";

export const createChannel = async (req: Request, res: Response) => {
  const { channelName, email, description, subscribersCount } = req.body;

  try {
    if (!channelName || !email) {
      res.status(400).json({ message: "Channel name and email are required" });
      return;
    }

    const newChannel = new Channel({
      channelName,
      email,
      description,
      subscribersCount
    });

    await newChannel.save();

    res
      .status(201)
      .json({ message: "Channel created successfully", data: newChannel });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to create channel", error: error.message });
  }
};

export const getAllChannels = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const channels = await Channel.find({ email });
    res
      .status(200)
      .json({ message: "Channels fetched successfully", data: channels });
  }
);

export const updateChannel = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { channelID, email, channelName, description, subscribersCount } =
      req.body;

    const channel = await Channel.findByIdAndUpdate(
      { channelID },
      { channelName, description, subscribersCount },
      { new: true, runValidators: true }
    );

    if (!channel) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Channel updated successfully", data: channel });
  }
);

export const deleteChannel = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { channelID } = req.body;
    const channel = await Channel.findByIdAndDelete(channelID);
    if (!channel) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Channel deleted successfully", data: null });
  }
);
