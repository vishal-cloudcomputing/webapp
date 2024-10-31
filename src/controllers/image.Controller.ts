import { Request, Response } from 'express';
import Image from '../model/image.Model'; 
import { fileUpload, deletingfile } from './awsS3.controller';
import logger from '../config/logger';
import crypto from 'crypto';
import timeDatabaseQuery from '../utils/timeDatabaseQuery'; 

export const getImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const image = await timeDatabaseQuery(
      async () => Image.findOne({ where: { user_id: userId } }),
      'getImage' 
    );

    if (!image) {
      logger.error('Profile picture not found');
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.json(image);
  } catch (error) {
    logger.error('Error retrieving profile picture:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req?.file;
    const userId = req.user?.id;

    if (!file) {
      logger.error('Invalid file format');
      return res.status(400).json({ error: 'Invalid file format' });
    }

    const existingImage = await timeDatabaseQuery(
      async () => Image.findOne({ where: { user_id: userId } }),
      'checkExistingImage' 
    );

    if (existingImage) {
      logger.error('Profile picture already exists');
      return res.status(400).json({ error: 'Profile picture already exists' });
    }

    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    file.filename = `CSYE6225_Profile_Pic_${uniqueSuffix}`;
    const file_name = file.filename;

    const uploadedImage = await fileUpload(file, file.filename); 

    const newImage = await timeDatabaseQuery(
      async () => Image.create({
        file_name: uploadedImage.Key,
        url: uploadedImage.Location,
        upload_date: new Date().toISOString().slice(0, 10),
        user_id: userId,
      }),
      'uploadImage'
    );

    logger.info('Profile picture uploaded successfully');
    res.status(201).json(newImage);
  } catch (error) {
    logger.error('Error uploading profile picture:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const image = await timeDatabaseQuery(
      async () => Image.findOne({ where: { user_id: userId } }),
      'getImageForDeletion' 
    );

    if (!image) {
      logger.error('Profile picture not found');
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    await deletingfile(image.file_name); 
    await timeDatabaseQuery(
      async () => image.destroy(),
      'deleteImage' 
    );

    logger.info('Profile picture deleted successfully');
    res.status(200).json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    logger.error('Error deleting profile picture:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};
