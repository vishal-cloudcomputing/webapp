import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/user.Model';
import logger from '../config/logger';
import timeDatabaseQuery from '../utils/timeDatabaseQuery'; 
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { randomUUID } from 'crypto';

const snsClient = new SNSClient({ region: process.env.AWS_REGION }); // Ensure this is set in your environment variables
const SNS_TOPIC_ARN = process.env.AWS_SNS_TOPIC_ARN; // Ensure this is set in your environment variables


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


    const email_sent_at = new Date().toISOString();
    const token = randomUUID();
    const token_expiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    const verificationUrl = `https://${process.env.DOMIN_NAME}/v1/user/verify?token=${token}`;
    const newUser = await timeDatabaseQuery(
      async () => User.create({
        email,
        first_name,
        last_name,
        password: bcryptPassword,
        email_sent_at,
        token,
        token_expiry,
      }),
      'createUser' 
    );

     



    const snsMessage = {
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      verification_url: verificationUrl
    };

    // Publish message to SNS topic
    try {
      if (SNS_TOPIC_ARN) {
        await snsClient.send(
          new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Message: JSON.stringify(snsMessage),
          })
        );
        logger.info('Verification email sent via SNS');
      } else {
        logger.warn('SNS_TOPIC_ARN not defined; skipping SNS message publishing.');
      }
    } catch (snsError) {
      logger.error('Failed to send verification email via SNS:', snsError);
    }

    console.log('Verification email sent via SNS');
    logger.info('Verification email sent via SNS');
    
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
    console.log(error);
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

export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  console.log(">>>>>>>>> inside verifyUser");

  const token = req.query.token as string | undefined;
  console.log(">>>>>>>>> token: ", token);

  // Check if token is provided
  if (!token) {
    res.status(400).json({ error: "Invalid verification link" });
    return;
  }

  try {
    // Attempt to find the user with the given token
    const user = await User.findOne({ where: { token: token } });

    if (!user) {
      res.status(400).json({ error: "Invalid verification token" });
      return;
    }

    // Check if user is already verified
    if (user.isVerified) {
      res.status(400).json({ error: "User already verified" });
      return;
    }
    const now = (): number => {
      return Date.now();  // Returns the current timestamp in milliseconds
    };

    // Check if the verification token has expired
    if (now() > user.token_expiry.getTime()) {
      res.status(400).json({ error: "Verification token has expired" });
      return;
    }

    // Set the user as verified and clear the verification token
    user.isVerified = true;
    await user.save();

    res.json({ success: "User verified successfully" });
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(503).json({ error: "An unexpected error occurred, please try again later" });
  }
};  