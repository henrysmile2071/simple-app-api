import { check, ValidationChain, validationResult } from 'express-validator';
import { getUserByEmail } from '@services/UserService';
import { Request, Response, NextFunction } from 'express';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all the validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    // If no errors, move to the next middleware
    next();
  };
}

export const userSignup = [
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .custom(async (email) => {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return Promise.reject('Email is already in use');
      }
    }),

  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[^,.'";[+-_#~`^()=|}{:/><@$!%*?&]/)
    .withMessage('Password must contain at least one special character'),

  check('passwordConfirmation')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

export const userPassword = [
  check('oldPassword').exists({ checkFalsy: true }).withMessage('Password is required'),

  check('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[^,.'";[+-_#~`^()=|}{:/><@$!%*?&]/)
    .withMessage('Password must contain at least one special character'),

  check('newPasswordConfirmation')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

export const userName = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name must not exceed 50 characters'),
]