import { User as CustomUser } from '@entities/User';

declare global {
  namespace Express {
    class User extends CustomUser {}
  }
}
