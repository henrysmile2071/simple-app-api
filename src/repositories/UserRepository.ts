import { AppDataSource } from "@config/db";
import { User } from "@entities/User";
import { MoreThan, Between } from "typeorm";
import { UserStats } from "@customTypes/custom";

export const userRepository = AppDataSource.getRepository(User);

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await userRepository.findOneBy({ email });
};

export const findUserById = async (id: string): Promise<User | null> => {
  return await userRepository.findOneBy({ id });
};

export const createUser = async (email: string, password: string | null, name: string | null, googleId: string | null): Promise<User> => {
  const user = new User();
  user.email = email;
  user.password = password;
  user.googleId = googleId;
  user.name = name;
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

export const updateUserPassword = async (id: string, password: string): Promise<string> => { 
  const user = await findUserById(id);
  if (!user) return "User not found";
  user.password = password;
  await user.hashPassword();
  await userRepository.save(user);
  return "Password updated successfully";
}

export const fetchUsersFromDatabase = async (): Promise<User[]> => {
  const users = await userRepository.find();
  return users;
}

export const updateUserLoginStats = async (user: User): Promise<User> => {
  user.loginCount++;
  user.lastActiveSession = new Date();
  return await userRepository.save(user);
}

export const fetchUsersStats = async (): Promise<UserStats | null> => {
  //total users count
  const totalUsers = await userRepository.count();
  
  //Active users today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const activeUserTodayCount = await userRepository.count({
    where: {
      lastActiveSession: MoreThan(startOfToday),
    },
  });

  // 7-day rolling average of daily active users
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const activeUsersPast7Days = await userRepository.count({
    where: {
      lastActiveSession: Between(sevenDaysAgo, now),
    },
  });

  const rolling7DayAvgActiveUserCount = Math.ceil(activeUsersPast7Days / 7);
  return {
    totalUsers,
    activeUserTodayCount,
    rolling7DayAvgActiveUserCount,
  };
}