import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uid } from 'uid'; 
import { bucketName, client } from ".";

async function putObject(filename: string, contentType: string, path: string) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `${path}/${filename}.mp4`,
    ContentType: contentType
  });
  const url = await getSignedUrl(client, command);
  return url;
}

async function uploadFile(url: string, file: Express.Multer.File) {
  const chunkSize = 10 * 1024 * 1024; 
  const fileSize = file.size;
  let start = 0;

  while (start < fileSize) {
    const chunk = file.buffer.slice(start, start + chunkSize); 
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.mimetype,
        'Content-Length': chunk.byteLength.toString(), 
      },
      body: chunk
    });

    start += chunkSize;
  }

  console.log('Upload completed!');
}

export async function init(file: Express.Multer.File, path: string) {
  if (file) {
    const url = await putObject(file.filename, file.mimetype, path);
    await uploadFile(url, file);
  } else {
    console.error("No file provided");
  }
}


