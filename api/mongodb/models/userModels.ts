import mongoose, { Document, Schema, Model } from 'mongoose';
const validator = require("validator") 
const bcrypt = require("bcrypt") 

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    passwordConfirmation?: string;

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
    }
});

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
    } catch (error:any) {
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
