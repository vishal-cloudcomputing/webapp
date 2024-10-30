import dotenv from 'dotenv';
import { S3} from 'aws-sdk';
import fs from 'fs';
import { ReadStream } from 'fs';
import 'dotenv/config';

const bucketRegion = process.env.AWS_Region as string; 
const bucketName = process.env.AWS_Bucket_Name as string; 
console.log(`====================`);
console.log(`bucketName: ${bucketName}`);
const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string; 
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string; 

const s3Upload = new S3({
  region: bucketRegion,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    }
});


async function upload(fileBuffer: Buffer, nameFile: string): Promise<S3.ManagedUpload.SendData> {
  return s3Upload.upload({
    Bucket: bucketName,
    Body: fileBuffer,  // Use the buffer directly here
    Key: nameFile,
    ContentType: 'image/jpeg',  // Or detect dynamically based on file type
  }).promise();
}

async function deleteFile(fileName: string): Promise<S3.DeleteObjectOutput> {
  return s3Upload.deleteObject({
    Bucket: bucketName,
    Key: fileName,
  }).promise();
}

export { upload, deleteFile };
