// config/passport.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getUserByEmail, getUserById, updateUserStats } from '@services/UserService';
import { sendConfirmationEmail } from '@utils/sendmail';
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

        const isEmailVerified = user.isEmailVerified;
        if (!isEmailVerified) {
          await sendConfirmationEmail(user.email, user.id);
          return done(null, false, { message: `Email not verified, please check ${email} inbox` });
        }
        await updateUserStats(user);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// // Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: 'YOUR_GOOGLE_CLIENT_ID',
//       clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
//       callbackURL: '/auth/google/callback',
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Find or create user in your database
//       return done(null, profile);
//     }
//   )
// );

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
