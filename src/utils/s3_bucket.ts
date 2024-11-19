import { S3} from 'aws-sdk';
import 'dotenv/config';

const bucketRegion = process.env.AWS_REGION as string; 
const bucketName = process.env.AWS_Bucket_Name as string; 

const s3Upload = new S3({
  region: bucketRegion,
});


async function upload(fileBuffer: Buffer, nameFile: string): Promise<S3.ManagedUpload.SendData> {
  return s3Upload.upload({
    Bucket: bucketName,
    Body: fileBuffer,  
    Key: nameFile,
    ContentType: 'image/jpeg', 
  }).promise();
}

async function deleteFile(fileName: string): Promise<S3.DeleteObjectOutput> {
  return s3Upload.deleteObject({
    Bucket: bucketName,
    Key: fileName,
  }).promise();
}

export { upload, deleteFile };
