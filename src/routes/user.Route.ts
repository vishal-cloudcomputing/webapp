import { Router } from 'express';
import { createUser, updateUser, getUser } from '../controllers/user.Controller';
import { basicAuth } from '../middlewares/auth';
import { createUserValidator, updateUserValidator } from '../middlewares/userValidation';
import handleValidationErrors from '../middlewares/handleValidationErrors';
import logger from '../config/logger';
import statsdClient from '../config/statsd';

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
    timeRequest('user', 'create', createUser),
    () => {
        statsdClient.increment('User.create');
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
    timeRequest('user', 'get', getUser),
    () => {
        statsdClient.increment('User.get');
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
