import mongoose, { Document, Schema, Model } from 'mongoose';
import validator from 'validator';

interface IVideo extends Document {
    keyID: string;
    title: string;
    channelID: Schema.Types.ObjectId;
    size: number;
    description?: string;
    uploader: Schema.Types.ObjectId; 
    duration: number; 
    thumbnail?: string; 
    views?: number;
    likes?: number;
    dislikes?: number;
    uploadDate: Date;
    category?: string;
    tags?: string[];
    comments?: Schema.Types.ObjectId[]; 
}

const videoSchema: Schema<IVideo> = new Schema({
    keyID: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    channelID:{
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: (value: string) => validator.isAlphanumeric(value.replace(/\s/g, '')),
            message: 'Title must contain only letters and numbers.'
        }
    },
    size: {
        type: Number,
        required: true,
        min: 1
    },
    description: {
        type: String,
        maxlength: 1000 
    },
    uploader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    thumbnail: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },

    category: {
        type: String,
        enum: ['Education', 'Entertainment', 'Music', 'Gaming', 'News', 'Other']
    }
}, { timestamps: true });

const Video: Model<IVideo> = mongoose.model<IVideo>('Video', videoSchema);

export default Video;
