import { findUserByEmail, findUserById, createUser } from '../repositories/UserRepository';
import { User } from '@entities/User';
import { UserProfile } from '@customTypes/custom';

// Find user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await findUserByEmail(email);
};

// Create a new user
export const registerUser = async (email: string, password: string): Promise<User> => {
  return await createUser(email, password);
};

// Find user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  return await findUserById(id);
};

// Find user Profile by Id
export const getUserProfileById = async (id: string): Promise<UserProfile | null> => { 
  const user = await findUserById(id);
  const userProfile = user ? { name: user.name, email: user.email } : null;
  return userProfile;
}