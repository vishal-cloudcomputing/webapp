import { body } from 'express-validator';

export const createUserValidator = [

  body('email').isEmail().withMessage('Please enter a valid email'),
  body('first_name').isString().notEmpty().withMessage('First name is required'),
  body('last_name').isString().notEmpty().withMessage('Last name is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const updateUserValidator = [
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];
