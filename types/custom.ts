import { User } from "@entities/User";
export interface UserProfile {
  name: string | null;
  email: string | null;
};

export type RequestWithUser = Express.Request & { user: User };
export function assertHasUser(req: Express.Request): asserts req is RequestWithUser {
  if (!('user' in req)) {
    throw new Error('Request object without user found unexpectedly');
  }
}

export interface UserStats {
  totalUsers: number; 
  activeUserTodayCount: number; 
  rolling7DayAvgActiveUserCount: number;
}

export interface UserStat {
  id: string;
  name: string;
  email: string;
  loginCount: number;
  lastActiveSession: Date;
  createdAt: Date;
}