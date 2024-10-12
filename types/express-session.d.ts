import 'express-session';
import { User } from '../src/database/entities/User.js';

declare module 'express-session' {
  interface SessionData {
    user: User;
  }
}
