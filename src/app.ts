import express from 'express';
import healthRoutes from './routes/health.Route';
import userRoutes from './routes/user.Route';
import imageRoutes from './routes/image.Route';
import { connectDb } from './config/database';
import "dotenv/config";
import logger from './config/logger';


const app = express();
app.use(express.json());


connectDb().catch((err) => {
  logger.error('Unable to connect to the database:', err);
  console.error('Failed to connect to the database:', err);
});

app.use('/v1', imageRoutes);
app.use('/v1', userRoutes);
app.use('/', healthRoutes);


app.get('/test', (req, res) => {
    res.status(200).send("Hello World");
    });

export default app;
