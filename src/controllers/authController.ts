import { Request, Response } from 'express';
import { registerUser } from '@services/UserService';
import { sendConfirmationEmail } from '@utils/sendmail';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const newUser = await registerUser(email, password, null, null);
  // send confirmation email
  await sendConfirmationEmail(newUser.email, newUser.id);
  res.status(201).json(newUser);
};
