import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/user.Model';

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
    res.status(401).json({ error: 'Authorization header missing or incorrect' });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');
  try {
    const user = await User.findOne({ where: { email } });

    console.log("User",user);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log("Is password valid",isPasswordValid); 
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    console.log("User",user);
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};
