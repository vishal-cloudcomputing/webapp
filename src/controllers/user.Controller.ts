import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/user.Model';
import logger from '../config/logger';
import timeDatabaseQuery from '../utils/timeDatabaseQuery'; 

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, first_name, last_name, password } = req.body;
    const existingUser = await timeDatabaseQuery(
      async () => User.findOne({ where: { email } }),
      'findUserByEmail' 
    );

    if (existingUser) {
      logger.error('Email already exists');
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const bcryptPassword = await bcrypt.hash(password, 10);

    const newUser = await timeDatabaseQuery(
      async () => User.create({
        email,
        first_name,
        last_name,
        password: bcryptPassword,
      }),
      'createUser' 
    );

    logger.info('User created successfully');
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.user?.id;
    const { first_name, last_name, password, ...invalidFields } = req.body;
    const invalidKeys = Object.keys(invalidFields);
    if (invalidKeys.length > 0) {
      logger.error('Invalid fields in the request');
      res.status(400).json({ error: 'Invalid fields in the request' });
      return;
    }

    if (!first_name && !last_name && !password) {
      logger.error('No valid fields to update');
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    
    const updatedData: Partial<User> = {};
    if (first_name) updatedData.first_name = first_name;
    if (last_name) updatedData.last_name = last_name;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    updatedData.account_updated = new Date();

    await timeDatabaseQuery(
      async () => User.update(updatedData, { where: { id } }),
      'updateUser' 
    );

    logger.info('User updated successfully');
    res.status(204).send();
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(400).json({ error: 'Bad Request' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user = await timeDatabaseQuery(
      async () => User.findOne({ where: { id: userId } }),
      'getUser' 
    );

    if (!user) {
      logger.error('User not found');
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      account_created: user.account_created,
      account_updated: user.account_updated,
    };

    logger.info('User retrieved successfully');
    res.status(200).json(userResponse);
  } catch (error) {
    logger.error('Error retrieving user:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};
