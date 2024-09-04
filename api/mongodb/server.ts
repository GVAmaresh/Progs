import express, { Express, Request, Response } from "express";
import next from "next";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter";
import commentRouter from "./routes/commentRouter";
import videoRouter from "./routes/videoRouter";
import channelRouter from "./routes/channelRouter";

dotenv.config({ path: "../../.env.local" });

const server: Express = express();

server.use(express.json());
server.use("/api/v1/users", userRouter);
server.use("/api/v1/comments", commentRouter);
 server.use("/api/v1/channel", channelRouter);
server.use("/api/v1/videos", videoRouter);


if (!(process.env.NEXT_PUBLIC_DB && process.env.NEXT_PUBLIC_PASSWORD)) {
  console.log("Cannot find the database credentials");
  process.exit(1);
}

const DB = process.env.NEXT_PUBLIC_DB.replace(
  "<PASSWORD>",
  process.env.NEXT_PUBLIC_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database Connected Successfully");

    const port = process.env.PORT || 4000;
    console.log(port);
    server.listen(port, () => {
      console.log(`App running on http://localhost:${port}`);
    });
  })
  .catch((err: any) => {
    console.log("Database Connection Failed");
    console.log(err);
    process.exit(1);
  });

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  console.log("Unhandled Rejection! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});