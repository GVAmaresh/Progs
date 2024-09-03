import express from "express";
import next from "next";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter";
import commentRouter from "./routes/commentRouter";
import videoRouter from "./routes/videoRouter";

dotenv.config({ path: "./.env.local" });

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

server.use(express.json());
server.use("/api/v1/users", userRouter);

server.use("api/v1/comments", commentRouter);
server.use("/api/v1/video", videoRouter);

server.all("*", (req, res) => {
  return handle(req, res);
});

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
app.listen(5000, () => {
  console.log('Server started on port 5000');
});