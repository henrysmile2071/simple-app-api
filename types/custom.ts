import { User } from "@entities/User";
export type UserProfile = {
  name: string | null;
  email: string | null;
};

export type RequestWithUser = Express.Request & { user: User };
export function assertHasUser(req: Express.Request): asserts req is RequestWithUser {
  if (!('user' in req)) {
    throw new Error('Request object without user found unexpectedly');
  }
}