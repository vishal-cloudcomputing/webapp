import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const validateImageFormat = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  if (!file) {
    logger.error('No file uploaded.');
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  if (!validMimeTypes.includes(file.mimetype)) {
    logger.error('Invalid image format. Supported formats: png, jpg, jpeg.');
    return res.status(400).json({ message: 'Invalid image format. Supported formats: png, jpg, jpeg.' });
  }
  next();
};
