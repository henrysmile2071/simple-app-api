import jwt from 'jsonwebtoken';

export const generateIdToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '5m' });
};

export const generateEmailToken = (email: string): string => {
  return jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1m' });
};