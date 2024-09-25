import { Router } from 'express';
import  healthCheck  from '../controllers/health.Controller';

const router = Router();

router.get('/healthz',healthCheck);

router.all('/healthz', (req, res) => {
    res.status(405).json({ message: 'Method Not Allowed' });
    });

router.all('*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
    }
);

export default router;
