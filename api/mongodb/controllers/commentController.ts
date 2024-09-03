import { Request, Response } from "express";
import Comment from "../models/commentModal";
import catchAsync from "../utils/catchAsync";


export const addComment = catchAsync(
  async (req: Request, res: Response) => {
    const { userID, videoID, content } = req.body;
    const newComment = new Comment({ user: userID, video: videoID, content });
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
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 }); 
      res.status(200).json({status:"success", data: comments, message:"Comments fetched successfully"})
})
