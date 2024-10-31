import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/user.Model';
import logger from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      user?: User;  
    }
  }
}

export const basicAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    logger.error('Authorization header missing or incorrect');
    res.status(401).json({ error: 'Authorization header missing or incorrect' });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.error('Invalid credentials');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error('Error authenticating user:', error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};
