import { AppDataSource } from "../config/db";
import { User } from "../entities/User";

export const userRepository = AppDataSource.getRepository(User);

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await userRepository.findOneBy({ email });
};

export const findUserById = async (id: string): Promise<User | null> => {
  return await userRepository.findOneBy({ id });
};

export const createUser = async (email: string, password: string): Promise<User> => {
  const user = new User();
  user.email = email;
  user.password = password;
  user.isEmailVerified = false;
  return await userRepository.save(user);
};
