import { findUserByEmail, findUserById, createUser, updateUserName, verifyUserEmail, updateUserPassword } from '../repositories/UserRepository';
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

// Update user name by Id
export const updateUserNameById = async (id: string, name: string): Promise<UserProfile | null> => {
  const user = await updateUserName(id, name);
  const userProfile = user ? { name: user.name, email: user.email } : null;
  return userProfile;
};

// Update user Email by Id
export const verifyUserEmailById = async (id: string):
  Promise<User | null> => {
  const user = await verifyUserEmail(id);
  return user;
}

export const updateUserPasswordById = async (id: string, password: string): Promise<string> => {
  const result = await updateUserPassword(id, password);
  return result;
}