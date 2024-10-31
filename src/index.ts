import app from './app';  
import "dotenv/config";
import logger from './config/logger';

const port = process.env.PORT || 3000;


app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  console.log(`Server is running on port ${port}`);
});
