// config/passport.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getUserByEmail, getUserById, registerUser, getUserByGoogleId } from '../services/UserService.js';
// Local Strategy for user-defined password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await getUserByEmail(email);
        if (!user) return done(null, false, { message: 'Email not found, please signup' });
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false, { message: 'Invalid password' })

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/auth/google/callback',
    },
    async(accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails) throw new Error('No email found in Google profile');
        let user = await getUserByGoogleId(profile.id);

        if (!user) {
          user = await registerUser(profile.emails?.[0].value, null, profile.displayName, profile.id);
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Export the configured passport instance
export default passport;
