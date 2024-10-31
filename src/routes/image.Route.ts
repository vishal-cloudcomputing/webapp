import { Router } from "express";
import multer from "multer";
import { uploadImage, getImage, deleteImage } from "../controllers/image.Controller"; 
import { basicAuth } from "../middlewares/auth";
import logger from "../config/logger";
import statsdClient from "../config/statsd";

const upload = multer({
  storage: multer.memoryStorage(), 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      logger.info("File format is valid");
      cb(null, true);
    } else {
      logger.error("File format is invalid");
      cb(null, false);
    }
  },
});

const router = Router();

router.post("/user/self/pic", basicAuth, upload.single("file"), async (req, res) => {
  const startTime = Date.now(); 
  statsdClient.increment('image.uploadcalled');
  try {
    const response = await uploadImage(req, res); 
    statsdClient.increment('image.uploaded');
    const duration = Date.now() - startTime; 
    statsdClient.timing('image.upload.duration', duration);
    return res.status(201).send(response);
  } catch (error) {
    logger.error("Error uploading image: ", error);
    const duration = Date.now() - startTime; 
    statsdClient.timing('image.upload.error.duration', duration); 
  }
});

router.get("/user/self/pic", basicAuth, async (req, res) => {
  const startTime = Date.now();
  statsdClient.increment('image.getcalled');
  try {
    const response = await getImage(req, res); 
    const duration = Date.now() - startTime; 
    statsdClient.timing('image.get.duration', duration);
    return res.status(200).send(response);
  } catch (error) {
    logger.error("Error getting image: ", error);
    const duration = Date.now() - startTime; 
    statsdClient.timing('image.get.error.duration', duration); 
    return res.status(404).json({ message: 'Not Found' });
  }
});

router.delete("/user/self/pic/", basicAuth, async (req, res) => {
  const startTime = Date.now(); 
  statsdClient.increment('image.deletecalled');
  try {
    const response = await deleteImage(req, res); 
    const duration = Date.now() - startTime; 
    statsdClient.timing('image.delete.duration', duration);
    return res.status(200).send(response);
  } catch (error) {
    logger.error("Error deleting image: ", error);
    const duration = Date.now() - startTime;
    statsdClient.timing('image.delete.error.duration', duration); 
    return res.status(404).json({ message: 'Not Found' });
  }
});

export default router;
