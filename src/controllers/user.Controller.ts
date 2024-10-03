import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/user.Model';


export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, first_name, last_name, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const bcryptPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      first_name,
      last_name,
      password: bcryptPassword,
    });

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    });
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.user?.id;
    const { first_name, last_name, password, ...invalidFields } = req.body;

    // Check for invalid fields in the body
    const invalidKeys = Object.keys(invalidFields);
    if (invalidKeys.length > 0) {
      res.status(400).json({ error: 'Invalid fields in the request' });
      return;
    }

    // Ensure that at least one valid field is provided
    if (!first_name && !last_name && !password) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    // Prepare the fields for update
    const updatedData: Partial<User> = {};
    if (first_name) updatedData.first_name = first_name;
    if (last_name) updatedData.last_name = last_name;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    updatedData.account_updated = new Date();

    await User.update(updatedData, { where: { id } });

   
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad Request' });
  }
};
  export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
  
      const user = await User.findOne({ where: { id: userId } });
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const userResponse = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        account_created: user.account_created,
        account_updated: user.account_updated
      }

      res.status(200).json(userResponse);
    } catch (error) {
      console.error(error);
      res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
    }
  };