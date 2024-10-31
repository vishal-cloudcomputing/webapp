import { deleteFile, upload } from "../utils/s3_bucket"; 
import logger from "../config/logger";
import statsdClient from "../config/statsd"; 

export const fileUpload = async (fileHere: { buffer: Buffer }, nameoffile: string) => {
    const startTime = Date.now();
    try {
        const ans = await upload(fileHere.buffer, nameoffile);
        logger.info("File uploaded successfully");
        const duration = Date.now() - startTime; 
        statsdClient.timing('S3.upload.duration', duration); 
        return ans;
    } catch (err) {
        logger.error("Unable to upload file", err);
        throw new Error("Unable to upload file"); 
    }
};

export const deletingfile = async (filename: string) => {
    const startTime = Date.now(); 
    try {
        const result = await deleteFile(filename);
        logger.info("File deleted successfully");
        const duration = Date.now() - startTime; 
        statsdClient.timing('S3.delete.duration', duration); 
        return result;
    } catch (error) {
        logger.error("Error in code: ", error);
        throw new Error("Error in code: " + error);
    }
};
