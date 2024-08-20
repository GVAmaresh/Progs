const mongoose = require("mongoose");
const dotenv = require("dotenv");
const express = require("express");

process.on("uncaughtException", (err) => {
  console.log("UncaughtException Shutting down....");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./.env.local" });
const app = express();

if (!(process.env && process.env.NEXT_PUBLIC_DB && process.env.NEXT_PUBLIC_PASSWORD)) {
  console.log("Cannot Found the database");
  process.exit(1);
}

const DB = process.env.NEXT_PUBLIC_DB.replace("<PASSWORD>", process.env.NEXT_PUBLIC_PASSWORD);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((err:any) => {
    console.log("Database Connection Failed");
    console.log(err);
    process.exit(1);
  });

if (!(process.env && process.env.PORT)) {
  console.log("Cannot Find the port");
  process.exit(1);
}
const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`App running on the port: ${port}`);
});

process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

