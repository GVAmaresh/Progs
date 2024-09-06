import { Request, Response } from "express";
import Video from "../models/videoModal";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import Channel from "../models/channelModal";
// key: completeData.videoUrl,
// email: newEmail,
// channelName: video.channelName,
// videoName: video.videoName,
// videoDescription: video.videoDescription,
// thumbnail: video.Thumbnail

export const addVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, email, channelName, videoName, videoDescription, thumbnail } =
      req.body;

    console.log(email, channelName, videoName, videoDescription);
    console.log(key, thumbnail);
    const channel = await Channel.findOne({ email, channelName });

    // Check if the channel exists
    if (!channel) {
      res.status(404).json({ success: false, message: "Channel not found" });
      return;
    }

    // Create the new video
    const video = new Video({
      keyID: key,
      channelID: channel._id,
      title: videoName,
      description: videoDescription,
      thumbnail: thumbnail
    });

    const savedVideo = await video.save();

    // Respond with the saved video
    res.status(201).json({ success: true, data: savedVideo });
  } catch (error: any) {
    console.error("Error adding video:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const editVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, size, tags, keyID } = req.body;

    const video = await Video.findByIdAndUpdate(
      id,
      { keyID, title, size, tags },
      { new: true, runValidators: true }
    );

    if (!video) {
      res.status(404).json({ success: false, message: "Video not found" });
      return;
    }

    res.status(200).json({ success: true, data: video });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteVideo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.body;

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      res.status(404).json({ success: false, message: "Video not found" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Video deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllVideos = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { start = 0 } = req.body;
    const startIndex = parseInt(start as string, 10);

    if (isNaN(startIndex) || startIndex < 0) {
      throw new AppError("Invalid start index", 400);
    }

    const videos = await Video.find()
      .skip(startIndex)
      .limit(20)
      .lean()
      .sort({ createdAt: -1 });

    if (videos.length === 0) {
      res.status(404).json({
        status: "fail",
        message: "No videos found"
      });
      return;
    }

    const safeVideos = videos.map((video) => ({
      ...video,
      _id: video._id.toString(),
      uploader: video.uploader ? video.uploader.toString() : null,
      createdAt: video.uploadDate.toISOString()
    }));

    res.status(200).json({
      status: "success",
      data: {
        videos: safeVideos
      }
    });
  }
);

export const getVideosByChannel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, channelName } = req.body;

    console.log(email, channelName);
    const channel = await Channel.findOne({ email, channelName });

    if (!channel) {
      res.status(404).json({ success: false, message: "Channel not found" });
      return;
    }

    const videos = await Video.find({ channelID: channel._id }).sort({
      createdAt: -1
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Video Extracted Successfully",
        data: videos
      });
  } catch (err: any) {
    console.error("Error getting videos by channel:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getVideoById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const video = await Video.findById(id).lean();

    if (!video) {
      res.status(404).json({ success: false, message: "Video not found" });
      return;
    }

    const safeVideo = {
      ...video,
      _id: video._id.toString(),
      uploader: video.uploader ? video.uploader.toString() : null,
      createdAt: video.uploadDate.toISOString()
    };

    res.status(200).json({
      status: "success",
      data: {
        video: safeVideo
      }
    });
  }
);
