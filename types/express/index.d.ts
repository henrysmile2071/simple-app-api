import { User as CustomUser } from '../../src/database/entities/User.js';

declare global {
  namespace Express {
    class User extends CustomUser {}
    interface AuthenticatedRequest extends Request {
      user: User;
    }
    
  }
}
