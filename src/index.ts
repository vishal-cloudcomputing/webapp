import express from 'express';
import healthRoutes from './routes/health.Route';
import { connectDb } from './config/database';
import "dotenv/config";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;


connectDb().catch((err) => {
  console.error('Failed to connect to the database:', err);
});

app.use(healthRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
