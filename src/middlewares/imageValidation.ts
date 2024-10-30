import { Request, Response, NextFunction } from 'express';

export const validateImageFormat = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  console.log(req.file)
  console.log(file);

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  if (!validMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({ message: 'Invalid image format. Supported formats: png, jpg, jpeg.' });
  }

  next();
};
