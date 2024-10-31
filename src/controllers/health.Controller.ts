import { Request, Response } from 'express';
import sequelize  from '../config/database' ;
import logger from '../config/logger';

const healthCheck = async (req: Request, res: Response) => {

  if (req.body && JSON.stringify(req.body) != '{}') {
    logger.error('Invalid request body');
    return res.status(400).send();
  }

  try {
    if (!sequelize) {
      res.setHeader('Cache-Control', 'no-cache');
      logger.error('Database connection not available');
      return res.status(503).send(); 
    }

    await sequelize.sync();  
    res.setHeader('Cache-Control', 'no-cache');
    logger.info('Health check successful');
    return res.status(200).send(); 

  } catch (error) {
    res.setHeader('Cache-Control', 'no-cache');
    logger.error('Health check failed:', error);
    return res.status(503).send();  
  }
};

export default healthCheck;
