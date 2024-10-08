import mongoose, { Document, Schema, Model } from 'mongoose';

interface IChannel extends Document {
  email: string;
  videoId: mongoose.Schema.Types.ObjectId;
  channelName: string;
  description?: string;
  channelIcon:string;
  subscribersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema: Schema<IChannel> = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    channelName: {
      type: String,
      required: true,
      trim: true,
    },
    channelIcon:{
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subscribersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);

const Channel: Model<IChannel> = mongoose.model<IChannel>('Channel', channelSchema);

export default Channel;
