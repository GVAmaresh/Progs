import { Request, Response } from "express";
import { bucketName, client, s3 } from "./";

import { uid } from "uid";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { init } from "./service";

export const initialUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, fileType } = req.body;
    
    const params = {
      Bucket: bucketName,
      Key: `Contents/${fileName as string}`,
      ContentType: fileType 
    };
    
    const upload = await s3.createMultipartUpload(params).promise();
    res.json({ uploadId: upload.UploadId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error initializing upload" });
  }
};

export const uploadChunks = async (req: Request, res: Response) => {
  const { index, fileName } = req.body;
  const file = req.file;
  if (!file) {
    res.status(404).json({ success: false, message: "File not found" });
    return;
  }

  const s3Params = {
    Bucket: bucketName,
    Key: `Contents/${fileName as string}`,
    Body: file.buffer,
    PartNumber: Number(index) + 1,
    UploadId: req.query.uploadId
  };

  s3.uploadPart(s3Params, (err: any) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Error uploading chunk" });
    }

    return res.json({ success: true, message: "Chunk uploaded successfully" });
  });
};


export const completeUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fileName } = req.query;
  const uploadId = req.query.uploadId;

  if (!uploadId || !fileName) {
    res.status(400).json({ success: false, message: "Missing uploadId or fileName" });
    return;
  }

  const listPartsParams = {
    Bucket: bucketName,
    Key: `Contents/${fileName as string}`,
    UploadId: uploadId as string
  };

  try {
    const listPartsResponse = await s3.listParts(listPartsParams).promise();

    if (!listPartsResponse.Parts || listPartsResponse.Parts.length === 0) {
      res.status(400).json({ success: false, message: "No parts found for the upload" });
      return;
    }

    const parts = listPartsResponse.Parts.map((part: any) => ({
      ETag: part.ETag,
      PartNumber: part.PartNumber
    }));

    const completeParams = {
      Bucket: bucketName,
      Key: `Contents/${fileName as string}`,
      UploadId: uploadId as string,
      MultipartUpload: {
        Parts: parts
      }
    };

    const completeUploadResponse = await s3.completeMultipartUpload(completeParams).promise();
    console.log("Upload complete response: ", completeUploadResponse);

    res.json({
      success: true,
      message: "Upload complete",
      key: completeUploadResponse.Key,
      data: completeUploadResponse
    });
  } catch (error) {
    console.error("Error completing upload:", error);

    // Optional: Clean up incomplete uploads to avoid orphaned multipart uploads in S3
    try {
      await s3.abortMultipartUpload({
        Bucket: bucketName,
        Key: `Contents/${fileName as string}`,
        UploadId: uploadId as string
      }).promise();
      console.log("Aborted incomplete upload due to error.");
    } catch (abortError) {
      console.error("Failed to abort multipart upload:", abortError);
    }

    res.status(500).json({ success: false, message: "Error completing upload" });
  }
};
// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { Request, Response } from "express";
// import { bucketName, client } from "./s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { uid } from "uid";

export const uploadChannelIcon = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const { buffer, mimetype } = req.file; 
    const pathType = req.params.pathType; 
    const filename = `${uid(16)}`; 

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${pathType}/${filename}`,
      Body: buffer,
      ContentType: mimetype || "application/octet-stream", 
    });

    await client.send(command);

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    res.status(200).json({
      message: "File uploaded successfully",
      key: `${pathType}/${filename}`,
      fileUrl: url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send('An error occurred while uploading the file.');
  }
};


// export const uploadChannelIcon = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }
//     const file = req.file; 

//     if (!file) {
//       return res.status(400).send('No file uploaded.');
//     }

//     const url = await init(file, "Channel_Icon");

//     res.status(200).json({ message: 'File uploaded successfully', url });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     res.status(500).send('An error occurred while uploading the file.');
//   }
// };
  // try {
  //   if (!req.file) {
  //     return res.status(400).json({ error: "No file uploaded" });
  //   }

  //   const { buffer, mimetype } = req.file;
  //   const filename = `${uid(16)}`;

  //   const command = new PutObjectCommand({
  //     Bucket: bucketName,
  //     Key: `Channel_Icon/${filename}`,
  //     Body: buffer,
  //     ContentType: mimetype || "application/octet-stream"
  //   });
  //   await client.send(command);
  //   const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  //   res.status(200).json({
  //     message: "File uploaded successfully",
  //     key: `Thumbnail/${filename}`,
  //     fileUrl: url
  //   });
  // } catch (error) {
  //   console.error("Error uploading file:", error);
  //   res.status(500).json({ error: "Error uploading file" });
  // }


export const deleteS3Object = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fileKey, thumbnailKey, channelIconKey } = req.body;
    const deletePromises = [];

    if (fileKey) {
      deletePromises.push(
        client.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: fileKey })
        )
      );
    }
    if (thumbnailKey) {
      deletePromises.push(
        client.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: thumbnailKey })
        )
      );
    }
    if (channelIconKey) {
      deletePromises.push(
        client.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: channelIconKey })
        )
      );
    }
    const results = await Promise.all(deletePromises);
    console.log("Success. Objects deleted.", results);
    res
      .status(200)
      .json({ message: "Objects deleted successfully", results: results });
    return;
  } catch (err) {
    console.log("Error", err);
  }
};
