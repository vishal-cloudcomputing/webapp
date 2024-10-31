import { Router } from "express";
import multer from "multer";
import { uploadImage, getImage, deleteImage } from "../controllers/image.Controller"; // Adjust path as needed
import { basicAuth } from "../middlewares/auth";
import logger from "../config/logger";
import statsdClient from "../config/statsd";

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage to access file buffer
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      logger.info("File format is valid");
      cb(null, true);
    } else {
      logger.error("File format is invalid");
     // cb(new Error('Invalid image format. Supported formats: png, jpg, jpeg.'), false);
    }
  },
});

const router = Router();

router.post("/user/self/pic", basicAuth, upload.single("file"), async (req, res) => {
  const startTime = Date.now(); // Start timer
  statsdClient.increment('image.uploadcalled');
  try {
    const response = await uploadImage(req, res); // Call your uploadImage function
    statsdClient.increment('image.uploaded');
    const duration = Date.now() - startTime; // Calculate duration in milliseconds
    statsdClient.timing('image.upload.duration', duration); // Send timing to StatsD
    return res.status(201).send(response);
  } catch (error) {
    logger.error("Error uploading image: ", error);
    const duration = Date.now() - startTime; // Calculate duration in case of error
    statsdClient.timing('image.upload.error.duration', duration); // Send error timing to StatsD
    return res.status(400).json({ message: 'Bad Request' });
  }
});

router.get("/user/self/pic", basicAuth, async (req, res) => {
  const startTime = Date.now(); // Start timer
  statsdClient.increment('image.getcalled');
  try {
    const response = await getImage(req, res); // Call your getImage function
    const duration = Date.now() - startTime; // Calculate duration in milliseconds
    statsdClient.timing('image.get.duration', duration); // Send timing to StatsD
    return res.status(200).send(response);
  } catch (error) {
    logger.error("Error getting image: ", error);
    const duration = Date.now() - startTime; // Calculate duration in case of error
    statsdClient.timing('image.get.error.duration', duration); // Send error timing to StatsD
    return res.status(404).json({ message: 'Not Found' });
  }
});

router.delete("/user/self/pic/", basicAuth, async (req, res) => {
  const startTime = Date.now(); // Start timer
  statsdClient.increment('image.deletecalled');
  try {
    const response = await deleteImage(req, res); // Call your deleteImage function
    const duration = Date.now() - startTime; // Calculate duration in milliseconds
    statsdClient.timing('image.delete.duration', duration); // Send timing to StatsD
    return res.status(200).send(response);
  } catch (error) {
    logger.error("Error deleting image: ", error);
    const duration = Date.now() - startTime; // Calculate duration in case of error
    statsdClient.timing('image.delete.error.duration', duration); // Send error timing to StatsD
    return res.status(404).json({ message: 'Not Found' });
  }
});

export default router;
