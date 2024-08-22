import { NextApiRequest, NextApiResponse } from "next";
import getSession from "next-session";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModels";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import dotenv from "dotenv";
import { promisify } from "util";
dotenv.config({ path: "./.env.local" });

interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET as string | undefined;
const JWT_EXPIRES_IN = process.env.NEXT_PUBLIC_JWT_EXPIRES_IN as
  | string
  | undefined;

const isHavingAccount = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) => {
  if (!req.body || !req.body.email) {
    return next(new AppError("Invalid request", 400));
  }

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(
      new AppError("User already exists! Please login instead.", 400)
    );
  }
  next();
};

const createToken = (userId: string, next: Function) => {
  if (!JWT_SECRET || !JWT_EXPIRES_IN) {
    return next(
      new AppError(
        "No JWT secret or expiresIn found in environment variables",
        500
      )
    );
  }

  const token = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
  return token;
};

export const signup = catchAsync(
  async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const { email, password, name } = req.body;
    await isHavingAccount(req, res, next);

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name
    });

    if (!newUser._id) {
      return next(new AppError("User not created", 500));
    }
    const token = createToken(newUser._id.toString(), next);
    if (!token) {
      return next(new AppError("Token creation failed", 500));
    }

    newUser.password = "undefined";
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser
      }
    });
  }
);

export const login = catchAsync(
  async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }
    if (!user._id) {
      return next(new AppError("User not created", 500));
    }

    const token = createToken(user._id.toString(), next);
    if (!token) {
      return next(new AppError("Token creation failed", 500));
    }

    user.password = "undefined";
    res.status(200).json({
      status: "success",
      token,
      data: {
        user
      }
    });
  }
);

export const logout = catchAsync(
  async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    res.setHeader(
      "Set-Cookie",
      "jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"
    );

    res.status(200).json({
      status: "success",
      message: "You have successfully logged out"
    });
  }
);

exports.protect = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: Function) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.token;
    }
    if (!token) {
      return next(new AppError("You are not logged in", 401));
    }
    if (!JWT_SECRET) {
      return next(
        new AppError("No JWT secret found in environment variables", 500)
      );
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await User.findById((decoded as any).id);
    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }
    req.user = currentUser;
    next();
  }
);

exports.getLoginUserID = catchAsync(
  async (req: AuthenticatedRequest, res: NextApiResponse, next: Function) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies?.token;
    }
    if (!token) {
      return next(new AppError("You are not logged in", 401));
    }
    if (!JWT_SECRET) {
      return next(
        new AppError("No JWT secret found in environment variables", 500)
      );
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await User.findById((decoded as any).id);
    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }
    req.user = currentUser;
    return currentUser._id; 
  }
);