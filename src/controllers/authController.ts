import { Request, Response } from 'express';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { AppDataSource } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const signup = async (req: Request, res: Response): Promise<void>=> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return
  }

  const { email, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return
    }

    const user = new User();
    user.email = email;
    user.password = password;
    await userRepository.save(user);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User created successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const googleAuth = (req: Request, res: Response): void => {
  const token = jwt.sign({ userId: (req.user as User).id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Google authentication successful', token });
};