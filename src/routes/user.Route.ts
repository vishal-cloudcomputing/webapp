import { Router } from 'express';
import { createUser, updateUser, getUser,verifyUser } from '../controllers/user.Controller';
import { basicAuth } from '../middlewares/auth';
import { createUserValidator, updateUserValidator } from '../middlewares/userValidation';
import handleValidationErrors from '../middlewares/handleValidationErrors';
import logger from '../config/logger';
import statsdClient from '../config/statsd';
import { Request, Response, NextFunction } from 'express';

const router = Router();

const timeRequest = (resource: string, method: string, handler: Function) => {
    return async (req: any, res: any) => {
        const startTime = Date.now();
        try {
            await handler(req, res);
        } finally {
            const duration = Date.now() - startTime; 
            statsdClient.timing(`${resource}.${method}.duration`, duration); 
        }
    };
};


router.post(
    '/user/',
    createUserValidator,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
        statsdClient.increment('User.create');
        timeRequest('user', 'create', createUser)(req, res);
    }
);

router.head('/user/self', (req, res) => {
    logger.error(`Method ${req.method} not allowed`);
    statsdClient.increment('User.head');
    res.status(405).send();
});


router.get(
    '/user/self',
    basicAuth,
    (req, res, next) => {
        statsdClient.increment('User.get');
        timeRequest('user', 'get', getUser)(req, res);
    }
);

router.get('/user/verify', (req, res) => {
    statsdClient.increment('User.verify');
    timeRequest('user', 'verify', verifyUser)(req, res); 
}
);


router.put(
    '/user/self',
    basicAuth,
    updateUserValidator,
    timeRequest('user', 'update', updateUser),
    () => {
        statsdClient.increment('User.update');
    }
);


router.all('/user/self', (req, res) => {
    logger.error(`Method ${req.method} not allowed`);
    statsdClient.increment('User.self.all');
    res.status(405).send();
});

export default router;
