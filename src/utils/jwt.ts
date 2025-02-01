import jwt from 'jsonwebtoken';

export const generateIdToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: 10 });//string value "30" means 30ms, numeric value 30 means 30sec.
};

export const generateEmailVerificationToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};