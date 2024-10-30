import { Router } from "express";
import multer from "multer";
import { uploadImage, getImage, deleteImage } from "../controllers/image.Controller"; // Adjust path as needed
import path from "path";
import { basicAuth } from "../middlewares/auth";

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage to access file buffer
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error(new Error("Images only with .png, .jpg, and .jpeg format are allowed"), false);
    }
  },
});

const router = Router();

router.post("/user/self/pic", basicAuth, upload.single("file"), uploadImage);
router.get("/user/self/pic", basicAuth,getImage);
router.delete("/user/self/pic/", basicAuth,deleteImage);

export default router;
