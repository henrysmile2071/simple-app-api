import { Router } from 'express';
import passport from '../config/passport.js';
import { signup } from '../controllers/authController.js';
import { validate, userSignup, assertHasUser, authToken } from '../middlewares/validators.js';
import {
  getUserByEmail,
  verifyUserEmailById,
  updateUserStats,
  getUserById,
} from '../services/UserService.js';
import jwt from 'jsonwebtoken';
import { generateIdToken, generateEmailToken } from '../utils/jwt.js';
import { sendConfirmationEmail } from '../utils/sendmail.js';
import { updateUserLoginStats } from '../repositories/UserRepository.js';
const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new user
 *     description: User sign-up with email and password.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - passwordConfirmation
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: Password!23
 *               passwordConfirmation:
 *                 type: string
 *                 description: The user's password confirmation
 *                 example: Password!23
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists.
 */
router.post('/signup', validate(userSignup), async (req, res, next): Promise<void> => {
  try {
    await signup(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login with email and password
 *     description: Logs in a user using their email and password with local strategy.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: Password!23
 *     responses:
 *       200:
 *         description: Successful login.
 *         headers:
 *           Set-Cookie:
 *             description: Sets a session cookie after successful login.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *               example:
 *                 message: "Login successful"
 *       403:
 *         description: User needs to verify their email, includes the token to send verification email(Forbidden).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "email not verified"
 *                 token:
 *                  type: string
 *                  example: "JWT_TOKEN"
 *               example:
 *                 message: "email not verified"
 *                 token: "JWT_TOKEN"
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid password"
 *               example:
 *                 message: "Invalid password"
 */
router.post(
  '/login',
  passport.authenticate('local', { failureFlash: true, failureRedirect: '/error' }),
  async (req, res) => {
    assertHasUser(req);
    const { email, isEmailVerified } = req.user;
    if (!isEmailVerified) {
      req.logOut((err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to log out' });
        }
        const token = generateEmailToken(email);
        res.status(403).json({ message: 'email not verified', token });
      });
      return;
    }
    await updateUserStats(req.user.id);
    res.status(200).json({ message: 'login success' });
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logs out the authenticated user
 *     description: Ends the session for the currently authenticated user and redirects to the login page.
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Successfully logged out and redirected to the login page.
 *       500:
 *         description: Failed to log out
 */
router.post('/logout', (req, res) => {
  // Clear the user from the session
  req.logout((err) => {
    if (err) {
      // Send error response with message
      return res.status(500).json({ error: 'Error during logout' });
    }

    // Destroy the session
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ error: 'Error destroying session' });
      }

      // Clear the session cookie
      res.clearCookie('connect.sid'); // Use your actual session cookie name here
      res.redirect('/login');
    });
  });
});

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Sends a verification email to the user's registered email address.
 *     description: verifies jwt token and then send verification email if passed.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: jwt token from unverified user email login
 *                 example: JWT_TOKEN
 *     responses:
 *       200:
 *         description: Successfully sent verification email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent to user@example.com.
 *       400:
 *         description: Token Error
 *       500:
 *         description: Internal server error.
 */
router.post('/send-verification-email', validate(authToken), async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    const user = await getUserByEmail(decoded.email);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    await sendConfirmationEmail(user.email, user.id);
    res.status(200).json({ message: `verification email sent to ${user.email}` });
  } catch (error) {
    next(error);
  }
});
/**
 * @swagger
 * /auth/token/:
 *   post:
 *     summary: Verify user login using a confirmation token.
 *     description: Confirms a user's email address by decoding a JWT token and update the user's login status.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: jwt token received from the email verification link or google callback.
 *                 example: JWT_TOKEN
 *     responses:
 *       200:
 *         description: Token successfully verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token verified!
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found.
 *       401:
 *         description: Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: unauthorized token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 */
router.post('/token', validate(authToken), async (req, res, next): Promise<void> => {
  try {
    const { token } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      console.error(error);
      res.status(401).send("unauthorized token")
      return;
    }
    //verify email for account
    await verifyUserEmailById(decoded.userId);
    const user = await getUserById(decoded.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    //if user has already logged in, redirect to home page without updating login stats
    if (req.isAuthenticated()) {
      console.log("already logged in");
      return res.redirect(`${process.env.HOME_PAGE_URL!}`);
    }
    req.login(user, async (err) => {
      if (err) {
        return res.status(500);
      }
      await updateUserLoginStats(decoded.userId);
      res.redirect(`${process.env.HOME_PAGE_URL!}`);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiates Google OAuth authentication.
 *     description: Redirects the user to Google's OAuth 2.0 login page to authenticate using their Google account.
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects to Google's OAuth 2.0 authorization page.
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback.
 *     description: Handles the callback after Google authenticates the user. If the authentication is successful, the user is redirected to the home page. On failure, they are redirected to the login page.
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description:
 *           - Redirects to the home page on successful login.
 *           - Redirects to the login page on authentication failure.
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.LOGIN_PAGE_URL! }),
  (req, res) => {
    assertHasUser(req);
    const token = generateIdToken(req.user.id);
    res.redirect(`${process.env.LOGIN_PAGE_URL!}?token=${token}`);
  }
);

export default router;
