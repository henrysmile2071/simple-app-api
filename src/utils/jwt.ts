import jwt from 'jsonwebtoken';

export const generateIdToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '10' });
};

export const generateEmailToken = (email: string): string => {
  return jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};