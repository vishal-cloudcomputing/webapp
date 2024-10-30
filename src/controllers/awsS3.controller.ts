import { deleteFile, upload } from "../utils/s3_bucket"; 
import fileStream from "fs";
import util from "util";

const unlinking = util.promisify(fileStream.unlink);

export const fileUpload = async (fileHere: { buffer: Buffer }, nameoffile: string) => {
    try {
        console.log(fileHere);

        // Pass the buffer directly to the upload function
        const ans = await upload(fileHere.buffer, nameoffile);

        // No need to unlink, since there’s no file on disk
        return ans;
    } catch (err) {
        console.error("Unable to upload file", err);
        throw new Error("Unable to upload file"); 
    }
}
;

export const deletingfile = async (filename: string) => {
    try {
        const result = await deleteFile(filename);
        return result;
    } catch (error) {
        console.error("Error in code:", error);
        throw new Error("Error in code: " + error);
    }
};


