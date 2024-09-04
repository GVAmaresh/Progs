import { Request, Response } from "express";
import Comment from "../models/commentModal";
import catchAsync from "../utils/catchAsync";


export const addComment = catchAsync(
  async (req: Request, res: Response) => {
    const { email, videoID, content } = req.body;
    const newComment = new Comment({ email: email, video: videoID, content });
    const savedComment = await newComment.save();
    res.status(201).json({
      status: "success",
      data: savedComment,
      message: "Succesfully added comment"
    });
  }
);

export const getComments = catchAsync(async(req: Request, res: Response) =>{
    const { videoId } = req.body;

    const comments = await Comment.find({ video: videoId })
      .sort({ createdAt: -1 }); 
      res.status(200).json({status:"success", data: comments, message:"Comments fetched successfully"})
})
