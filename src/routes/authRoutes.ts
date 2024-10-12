import { Router } from 'express';
import passport from '../config/passport.js';
import { signup } from '../controllers/authController.js';
import { validate, userSignup, assertHasUser } from '../middlewares/validators.js';
import { verifyUserEmailById } from '../services/UserService.js';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/jwt.js';
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
 *       401:
 *         description: Invalid credentials (Unauthorized).
 */
router.post(
  '/login',
  passport.authenticate('local', { failureFlash: true, failureRedirect: '/error' }),
  async (req, res) => {
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
  req.logout((err) => {
    if (err) {
      req.flash('error', 'Failed to log out');
      return res.status(500);
    }
    req.flash('success', 'Logged out successfully');
    res.redirect('/login');
  });
});

/**
 * @swagger
 * /auth/token/:
 *   post:
 *     summary: Verify user login using a confirmation token.
 *     description: Confirms a user's email address by decoding a JWT token and updating the user's verification status.
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
 *       400:
 *         description: Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token.
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
router.post('/token', async (req, res, next): Promise<void> => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await verifyUserEmailById(decoded.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    req.session.user = user;
    res.cookie('connect.sid', req.session.id, { httpOnly: true, secure: true });
    res.status(200).json({ message: 'Token verified!' });
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
 *         headers:
 *           Set-Cookie:
 *             description: Sets a session cookie after successful login.
 *             schema:
 *               type: string
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.LOGIN_PAGE_URL! }),
  (req, res) => {
    assertHasUser(req);
    const token = generateToken(req.user.id);
    res.redirect(`${process.env.HOME_PAGE_URL!}?token=${token}`);
  }
);

export default router;
