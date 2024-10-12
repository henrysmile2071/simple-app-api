import { User } from '../src/database/entities/User.js';
export interface UserProfile {
  name: string | null;
  email: string | null;
}

export type RequestWithUser = Express.Request & { user: User };

export interface UserStats {
  totalUsers: number;
  activeUserTodayCount: number;
  rolling7DayAvgActiveUserCount: number;
}

export interface UserStat {
  id: string;
  name: string | null;
  email: string;
  loginCount: number;
  lastActiveSession: Date | null;
  createdAt: Date;
}
