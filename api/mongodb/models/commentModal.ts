import mongoose, { Document, Schema, Model } from 'mongoose';

interface IComment extends Document {
  email: string;
  video: mongoose.Schema.Types.ObjectId;
  content: string;
}

const commentSchema: Schema<IComment> = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
