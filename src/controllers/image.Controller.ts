import { Request, Response } from 'express';
import Image from '../model/image.Model'; 
import { fileUpload, deletingfile } from './awsS3.controller';

export const getImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const image = await Image.findOne({ where: { user_id: userId } });

    if (!image) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.json(image)
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};

import crypto from 'crypto';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req?.file;
    const userId = req.user?.id;
    console.log(`this is file`,file);
    console.log('this is user id',userId);

    if (!file || !userId) {
      return res.status(400).json({ error: 'File or user information is missing.' });
    }

    const existingImage = await Image.findOne({ where: { user_id: userId } });

    if (existingImage) {
      
      await deletingfile(existingImage.file_name);
      await existingImage.destroy();
    }

    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    file.filename = `CSYE6225_Profile_Pic_${uniqueSuffix}`;
    const file_name = file.filename;
    // Upload the new image to S3
    const uploadedImage = await fileUpload(file, file.filename);

    // Save the new image information to the database
    const newImage = await Image.create({
      file_name: uploadedImage.Key,
      url: uploadedImage.Location,
      upload_date: new Date().toISOString().slice(0, 10),
      user_id: userId,
    });

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};


export const deleteImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const image = await Image.findOne({ where: { user_id: userId } });

    if (!image) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    await deletingfile(image.file_name);
    await image.destroy();

    res.status(200).json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};
