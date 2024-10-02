// config/passport.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { getUserByEmail, getUserById } from '../services/UserService';

// Local Strategy for user-defined password authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const isMatch = user.password ? bcrypt.compare(password, user.password) : false;
      if (!isMatch) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: '/auth/google/callback',
},
(accessToken, refreshToken, profile, done) => {
  // Find or create user in your database
  return done(null, profile);
}));

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Export the configured passport instance
export default passport;
