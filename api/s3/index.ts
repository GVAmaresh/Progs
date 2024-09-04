import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import dotenv from "dotenv";

import { S3Client } from "@aws-sdk/client-s3";

import {
  completeUpload,
  deleteS3Object,
  initialUpload,
  uploadChannelIcon,
  uploadChunks,
  uploadThumbNail
} from "./components";
const AWS = require("aws-sdk");
dotenv.config({ path: "./.env.local" });

const app = express();

export const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string;
export const secretAccessKey = process.env
  .NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string;
export const region = process.env.NEXT_PUBLIC_AWS_REGION as string;
export const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME as string;

if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
  console.error("Missing required environment variables");
  process.exit(1);
}

export const client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  endpoint: `https://${bucketName}.s3.${region}.amazonaws.com`
});

export const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/initiateUpload", initialUpload);

app.post("/upload", upload.single("file"), uploadChunks);

app.post("/completeUpload", completeUpload);

app.post("/uploadThumbnail", upload.single("file"), uploadThumbNail);

app.post("/uploadChannelIcon", upload.single("file"), uploadChannelIcon);

app.post("/deleteObject", deleteS3Object);

const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
