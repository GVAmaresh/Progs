import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, ListPartsCommand, CompleteMultipartUploadCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { uid } from 'uid';
import { uploadChannelIcon } from './components';
const AWS = require('aws-sdk');
dotenv.config({ path: './.env.local' });

const app = express();

export const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string;
export const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string;
export const region = process.env.NEXT_PUBLIC_AWS_REGION as string;
export const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME as string;
// const s3Endpoint = process.env.NEXT_PUBLIC_AWS_S3_ENDPOINT as string;

if (!accessKeyId || !secretAccessKey || !region || !bucketName ) {
  console.error('Missing required environment variables');
  process.exit(1);
}


export const client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  // endpoint: `https://${bucketName}.s3.${region}.amazonaws.com`,
});
export const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/initiateUpload', async (req, res) => {
  try {
    const { fileName } = req.body;
    const params = {
      Bucket: bucketName,
      Key: `Contents/${fileName as string}`,
    };
    const upload = await s3.createMultipartUpload(params).promise();
    res.json({ uploadId: upload.UploadId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error initializing upload' });
  }
});

app.post('/upload', upload.single("file"), (req, res) => {
  const { index, fileName } = req.body;
  const file = req.file;
  if(!file){
    res.status(404).json({ success: false, message:"File not found"})
    return
  }
 
  const s3Params = {
    Bucket: bucketName,
    Key: `Contents/${fileName as string}`,
    Body: file.buffer,
    PartNumber: Number(index) + 1,
    UploadId: req.query.uploadId
  };

  s3.uploadPart(s3Params, (err:any) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Error uploading chunk' });
    }

    return res.json({ success: true, message: 'Chunk uploaded successfully' });
  });
});

app.post('/completeUpload', async (req: Request, res: Response) => {
  const { fileName } = req.query;
  const uploadId = req.query.uploadId;

  if (!uploadId || !fileName) {
    return res.status(400).json({ success: false, message: 'Missing uploadId or fileName' });
  }

  const listPartsParams = {
    Bucket: bucketName,
    Key: `Contents/${fileName as string}`,
    UploadId: uploadId as string,
  };

  try {
    const listPartsResponse = await s3.listParts(listPartsParams).promise();

    const parts = listPartsResponse.Parts?.map((part:any) => ({
      ETag: part.ETag,
      PartNumber: part.PartNumber,
    })) || [];

    const completeParams = {
      Bucket: bucketName,
      Key: `Contents/${fileName as string}`,
      UploadId: uploadId as string,
      MultipartUpload: {
        Parts: parts,
      },
    };

    const completeUploadResponse = await s3.completeMultipartUpload(completeParams).promise();
    console.log("Upload complete response: ", completeUploadResponse);

    return res.json({ success: true, message: 'Upload complete', data: completeUploadResponse, key:completeUploadResponse.Key });
  } catch (error) {
    console.error('Error completing upload:', error);
    return res.status(500).json({ success: false, message: 'Error completing upload' });
  }
});


app.post('/upload-channel-icon', upload.single('file'), (req, res) => {
  req.params.pathType = 'Channel_Icons'; 
  uploadChannelIcon(req, res);
});

app.post('/upload-thumbnail-icon', upload.single('file'), (req, res) => {
  req.params.pathType = 'Thumbnails'; 
  uploadChannelIcon(req, res);
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
