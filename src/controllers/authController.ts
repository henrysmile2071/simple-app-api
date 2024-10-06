import { NextFunction, Request, Response } from 'express';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';
import { passwordValidator } from '@middlewares/validators';
import { registerUser, getUserByEmail } from '@services/UserService';
import { sendConfirmationEmail } from '@utils/sendmail';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).send('Missing email or password');
      return;
    }
    if (!passwordValidator(password)) {
      res.status(400).send('Invalid password format');
      return;
    }
    if (req.body.password !== req.body.passwordConfirmation) {
      res.status(400).send('Passwords do not match');
      return;
    }
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    // pass validation
    const newUser = await registerUser(email, password);
    // send confirmation email
    await sendConfirmationEmail(newUser.email, newUser.id);

    res.status(201).json(newUser);
  } catch (error) {
    next(error)
  }
};

export const googleAuth = (req: Request, res: Response): void => {
  const token = jwt.sign({ userId: (req.user as User).id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Google authentication successful', token });
};