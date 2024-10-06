import { AppDataSource } from "../config/db";
import { User } from "../entities/User";

export const userRepository = AppDataSource.getRepository(User);

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await userRepository.findOneBy({ email });
};

export const findUserById = async (id: string): Promise<User | null> => {
  return await userRepository.findOneBy({ id });
};

export const createUser = async (email: string, password: string, googleId?: string): Promise<User> => {
  const user = new User();
  user.email = email;
  user.password = password;
  user.googleId = googleId;
  user.isEmailVerified = googleId ? true : false;
  return await userRepository.save(user);
};

export const updateUserName = async (id: string, name: string): Promise<User | null> => {
  const user = await findUserById(id);
  if (!user) return null;
  user.name = name;
  return await userRepository.save(user); 
}

export const verifyUserEmail = async (id: string): Promise<User | null> => {
  const user = await findUserById(id);
  if (!user) return null;
  user.isEmailVerified = true;
  return await userRepository.save(user);
};
