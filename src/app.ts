import express from 'express';
import healthRoutes from './routes/health.Route';
import userRoutes from './routes/user.Route';
import { connectDb } from './config/database';
import "dotenv/config";


const app = express();
app.use(express.json());


connectDb().catch((err) => {
  console.error('Failed to connect to the database:', err);
});


app.use('/v2', userRoutes);
app.use('/', healthRoutes);

app.get('/test', (req, res) => {
    res.status(200).send("Hello World");
    });

export default app;
