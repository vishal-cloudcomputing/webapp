import { Router } from 'express';
import { createUser, updateUser, getUser } from '../controllers/user.Controller';
import { basicAuth } from '../middlewares/auth';
import { createUserValidator,updateUserValidator } from '../middlewares/userValidation';
import handleValidationErrors from '../middlewares/handleValidationErrors';
const router = Router();

router.post('/user/',createUserValidator,handleValidationErrors, createUser);

router.head('/user/self', (req, res) => {
    res.status(405).send();
    }
);

router.get('/user/self', basicAuth, getUser);

router.put('/user/self', basicAuth, updateUserValidator, updateUser);

router.all('/user/self', (req, res) => {
    res.status(405).send();
    });    

export default router;
