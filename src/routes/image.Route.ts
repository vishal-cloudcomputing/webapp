import { Router, Request, Response } from "express";
import multer from "multer";
import { uploadImage, getImage, deleteImage } from "../controllers/image.Controller";
import { basicAuth } from "../middlewares/auth";
import logger from "../config/logger";
import statsdClient from "../config/statsd";
import { validateImageFormat } from "../middlewares/imageValidation";
import handleValidationErrors from "../middlewares/handleValidationErrors";


const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      logger.error('Invalid image format. Supported formats: png, jpg, jpeg.');
    }
  },
});

const router = Router();

const timeRequest = (resource: string, method: string) => {
  return async (req: Request, res: Response, next: Function) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      statsdClient.timing(`${resource}.${method}.duration`, duration);
    });
    next();
  };
};


router.post("/user/self/pic", basicAuth, validateImageFormat, handleValidationErrors, upload.single("file"), timeRequest('image', 'upload'), async (req: Request, res: Response) => {
  await uploadImage(req, res);
  statsdClient.increment('image.upload');
});


router.get("/user/self/pic", basicAuth, timeRequest('image', 'get'), async (req: Request, res: Response) => {
  await getImage(req, res);
  statsdClient.increment('image.get');
});


router.delete("/user/self/pic/", basicAuth, timeRequest('image', 'delete'), async (req: Request, res: Response) => {
  await deleteImage(req, res);
  statsdClient.increment('image.delete');
});

export default router;
