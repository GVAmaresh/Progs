import mongoose, { Document, Schema, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    passwordConfirmation?: string;
    bio?: string;
    createdAt?: Date;
    updatedAt?: Date;
    subscriptions?: string[]; 
    playlists?: { name: string; videos: string[] }[]; 
    videos?: string[]; 
    isAdmin?: boolean;
    role?: string;
    isPremium?: boolean;
    active?: boolean;
    preferences?: { theme: string; notifications: boolean }; 
    isPasswordMatch(password: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    avatar: {
        type: String
    },
    bio: {
        type: String,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    role:{
        type: String,
        enum: ['user', 'admin', "content"],
        default: 'user'
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    active:{
        type: Boolean,
        default: true
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    }
}, { timestamps: true });

userSchema.virtual('passwordConfirmation')
    .set(function(this: any, value: string) {
        this._passwordConfirmation = value;
    })
    .get(function(this: any) {
        return this._passwordConfirmation;
    });

userSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

userSchema.methods.isPasswordMatch = async function(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

userSchema.post<IUser>('validate', function(this: any, doc: IUser, next) {
    if (this.password !== this._passwordConfirmation) {
        this.invalidate('passwordConfirmation', 'Passwords are not the same!');
    }
    next();
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
