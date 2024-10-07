import { NextFunction, Request, Response } from 'express';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';
import { registerUser } from '@services/UserService';
import { sendConfirmationEmail } from '@utils/sendmail';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const newUser = await registerUser(email, password);
  // send confirmation email
  await sendConfirmationEmail(newUser.email, newUser.id);
  res.status(201).json(newUser);
};

export const googleAuth = (req: Request, res: Response): void => {
  const token = jwt.sign({ userId: (req.user as User).id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Google authentication successful', token });
};
