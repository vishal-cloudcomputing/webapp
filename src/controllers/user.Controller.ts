import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/user.Model';


export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Inside create user");
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
      const { first_name, last_name, password } = req.body;
  

      if (!first_name && !last_name && !password) {
        res.status(400).json({ error: 'No valid fields to update' });
        return;
      }
  
      const updatedData: Partial<User> = {};
      if (first_name) updatedData.first_name = first_name;
      if (last_name) updatedData.last_name = last_name;
      if (password) updatedData.password = await bcrypt.hash(password, 10);
  
      updatedData.account_updated = new Date();
  
      await User.update(updatedData, { where: { id: id } });
  
      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
    }
  };

  export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Inside get user");
      console.log(req.user?.id);
      const userId = req.user?.id;
  
      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'first_name', 'last_name', 'account_created', 'account_updated'],  
      });
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
    }
  };