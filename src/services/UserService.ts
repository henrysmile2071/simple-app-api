import { findUserByEmail, findUserById, createUser } from '../repositories/UserRepository';
import { User } from '../entities/User';

// Find user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await findUserByEmail(email);
};

// Create a new user
export const registerUser = async (email: string, password: string): Promise<User>  => {
  return await createUser(email, password);
};

// Find user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  return await findUserById(id);
};
