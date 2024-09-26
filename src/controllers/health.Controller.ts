import { Request, Response } from 'express';
import sequelize  from '../config/database' ;

const healthCheck = async (req: Request, res: Response) => {

  if (req.body && JSON.stringify(req.body) != '{}') {
    return res.status(400).send();
  }

  try {
    if (!sequelize) {
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(503).send(); 
    }

    await sequelize.sync();  
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(); 

  } catch (error) {
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(503).send();  
  }
};

export default healthCheck;
