import { AppDataSource } from '../database/data-source.js';
import { User } from '../database/entities/User.js';
import { SessionLog } from '../database/entities/SessionLog.js';
import { MoreThan, IsNull } from 'typeorm';
import { UserStats } from '../../types/custom.js';

export const userRepository = AppDataSource.getRepository(User);
export const sessionLogRepository = AppDataSource.getRepository(SessionLog);

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await userRepository.findOneBy({ email, googleId: IsNull()});
};

export const findUserById = async (id: string): Promise<User | null> => {
  return await userRepository.findOneBy({ id });
};

export const createUser = async (
  email: string,
  password: string | null,
  name: string | null,
  googleId: string | null
): Promise<User> => {
  const user = new User();
  user.email = email;
  user.password = password;
  user.googleId = googleId;
  user.name = name;
  user.isEmailVerified = googleId ? true : false;
  return await userRepository.save(user);
};

export const createSessionLog = async (userId: string): Promise<void> => {
  const sessionLog = new SessionLog();
  sessionLog.userId = userId;
  await sessionLogRepository.save(sessionLog);
  return;
};

export const updateUserName = async (id: string, name: string): Promise<User | null> => {
  const user = await findUserById(id);
  if (!user) return null;
  user.name = name;
  return await userRepository.save(user);
};

export const verifyUserEmail = async (id: string): Promise<User | null> => {
  const user = await findUserById(id);
  if (!user) return null;
  user.isEmailVerified = true;
  return await userRepository.save(user);
};

export const updateUserPassword = async (id: string, password: string): Promise<string> => {
  const user = await findUserById(id);
  if (!user) return 'User not found';
  user.password = password;
  await user.hashPassword();
  await userRepository.save(user);
  return 'Password updated successfully';
};

export const fetchUsersFromDatabase = async (): Promise<User[]> => {
  const users = await userRepository.find();
  return users;
};

export const updateUserLoginStats = async (id: string): Promise<User | null> => {
  const user = await findUserById(id);
  if (!user) return null;
  user.loginCount++;
  user.lastActiveSession = new Date();
  createSessionLog(user.id);
  return await userRepository.save(user);
};

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

 const activeUserCountPast7Days = await sessionLogRepository
   .createQueryBuilder('sessionLogs')
   .select('sessionLogs.userId')
   .where("sessionLogs.loginTime > NOW() - INTERVAL '7 DAYS'")
   .groupBy('sessionLogs.userId')
   .getCount();

  const rolling7DayAvgActiveUserCount = Math.ceil(activeUserCountPast7Days / 7);
  return {
    totalUsers,
    activeUserTodayCount,
    rolling7DayAvgActiveUserCount,
  };
};
