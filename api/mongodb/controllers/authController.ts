import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModels";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });
interface AuthenticatedRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET as string | undefined;
const JWT_EXPIRES_IN = process.env.NEXT_PUBLIC_JWT_EXPIRES_IN as
  | string
  | undefined;

const isHavingAccount = async (req: Request, res: Response) => {
  if (!req.body || !req.body.email) {
    throw new AppError("Invalid request", 400);
  }

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    throw new AppError("User already exists! Please login instead.", 400);
  }
};

const createToken = (userId: string) => {
  if (!JWT_SECRET || !JWT_EXPIRES_IN) {
    throw new AppError(
      "No JWT secret or expiresIn found in environment variables",
      500
    );
  }

  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const signup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    await isHavingAccount(req, res);

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name
    });

    if (!newUser._id) {
      throw new AppError("User not created", 500);
    }

    const token = createToken(newUser._id.toString());
    if (!token) {
      throw new AppError("Token creation failed", 500);
    }

    newUser.password = "undefined";
    res.status(201).json({
      status: "success",
      token,
      data: { user: newUser }
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError("Incorrect email or password", 401);
    }
    if (!user._id) {
      throw new AppError("User not created", 500);
    }
    const token = createToken(user._id.toString());
    if (!token) {
      throw new AppError("Token creation failed", 500);
    }

    user.password = "undefined";
    res.status(200).json({
      status: "success",
      token,
      data: { user }
    });
  }
);

export const logout = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
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

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: () => void
) => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError("You are not logged in", 401);
    }

    
    if (!JWT_SECRET) {
      throw new AppError("No JWT secret found in environment variables", 500);
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      throw new AppError("User no longer exists", 401);
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status((err as AppError).statusCode || 500).json({
      status: "fail",
      message: (err as AppError).message || "An error occurred"
    });
  }
};

export const getLoginUserID = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies?.token;
    }

    if (!token) {
      throw new AppError("You are not logged in", 401);
    }

    if (!JWT_SECRET) {
      throw new AppError("No JWT secret found in environment variables", 500);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      throw new AppError("User no longer exists", 401);
    }

    req.user = currentUser;
    return res.status(200).json({ userId: currentUser._id });
  } catch (err) {
    res.status((err as AppError).statusCode || 500).json({
      status: "fail",
      message: (err as AppError).message || "An error occurred"
    });
  }
};
