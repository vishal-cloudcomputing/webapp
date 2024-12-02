import { Router, Request, Response } from 'express';
import healthCheck from '../controllers/health.Controller'; 
import logger from '../config/logger';
import statsdClient from '../config/statsd';

const router = Router();

const timeRequest = (resource: string, method: string, handler: (req: Request, res: Response) => Promise<void>) => {
    return async (req: Request, res: Response) => {
        const startTime = Date.now();

        try {
            await handler(req, res); 
        } finally {
            const duration = Date.now() - startTime; 
            statsdClient.timing(`${resource}.${method}.duration`, duration); 
        }
    };
};

router.get('/healthz', timeRequest('healthz', 'get', async (req: Request, res: Response) => {
    await healthCheck(req, res); 
    statsdClient.increment('health.check'); 
}));
// This is a test for the cicd pipeline
// router.get('/cicd', timeRequest('healthz', 'get', async (req: Request, res: Response) => {
//     await healthCheck(req, res); 
//     statsdClient.increment('health.check'); 
// }));

router.all('/healthz', (req: Request, res: Response) => {
    logger.error(`Method ${req.method} not allowed for /healthz`);
    statsdClient.increment('health.all'); 
    res.status(405).send();
});


router.all('*', (req: Request, res: Response) => {
    logger.error(`Route ${req.path} not found`);
    statsdClient.increment('exception.routeNotFound');
    res.status(404).send();
});

export default router;
