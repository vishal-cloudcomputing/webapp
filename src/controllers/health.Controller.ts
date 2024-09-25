import { Request, Response } from 'express';
import sequelize  from '../config/database' ;

const healthCheck = async (req: Request, res: Response) => {

  if (req.body && JSON.stringify(req.body) != '{}') {
    return res.status(400).json({message:'Bad Request: No payload allowed'});
  }

  try {
    if (!sequelize) {
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(503).json({message:'Service Unavailable'}); 
    }

    await sequelize.sync();  
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json({message:'OK'}); 

  } catch (error) {
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(503).json({message:'Service Unavailable'});  
  }
};

export default healthCheck;
