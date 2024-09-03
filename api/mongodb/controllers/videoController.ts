import { Request, Response } from "express";
import Video from "../models/videoModal";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

export const addVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyID, title, size, tags } = req.body;
    const video = new Video({
      keyID,
      title,
      size,
      tags
    });

    await video.save();
    if (!video) {
      res.status(404).json({ success: false, message: "Video not found" });
      return;
    }
    res.status(201).json({ success: true, data: video });
  } catch (error: any) {
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
