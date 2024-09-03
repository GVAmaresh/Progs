import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, ListPartsCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { uid } from 'uid';

dotenv.config({ path: './.env.local' });

const app = express();

const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string;
const region = process.env.NEXT_PUBLIC_AWS_REGION as string;
const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME as string;

if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/initiateUpload', async (req: Request, res: Response) => {
  try {
    const { fileName, contentType } = req.body;
    const command = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: contentType,
    });
    const upload = await client.send(command);
    res.json({ uploadId: upload.UploadId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error initializing upload' });
  }
});

app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { index, fileName, uploadId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const command = new UploadPartCommand({
      Bucket: `${bucketName}/contents`,
      Key: fileName,
      PartNumber: Number(index) + 1,
      UploadId: uploadId,
      Body: file.buffer,
    });

    await client.send(command);
    res.json({ success: true, message: 'Chunk uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error uploading chunk' });
  }
});

app.post('/completeUpload', async (req: Request, res: Response) => {
  try {
    const { fileName, uploadId } = req.body;

    const listPartsCommand = new ListPartsCommand({
      Bucket: `${bucketName}/contents`,
      Key: fileName,
      UploadId: uploadId,
    });

    const listPartsResponse = await client.send(listPartsCommand);

    const parts = listPartsResponse.Parts?.map(part => ({
      ETag: part.ETag,
      PartNumber: part.PartNumber,
    })) || [];

    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: `${bucketName}/contents`,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });

    const result = await client.send(completeCommand);
    res.json({ success: true, message: 'Upload complete', data: result.Location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error completing upload' });
  }
});

app.post('/uploadThumbnail', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype } = req.file;
    const filename = `${uid(16)}`;

    const command = new PutObjectCommand({
      Bucket: `${bucketName}/thumbnail`,
      Key: filename,
      Body: buffer,
      ContentType: mimetype,
    });

    await client.send(command);

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: url,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
