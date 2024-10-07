import { Router } from 'express';
import passport from '@config/passport';
import { signup } from '@controllers/authController';
import { validate, userSignup } from '@middlewares/validators';
import { verifyUserEmailById } from '@services/UserService';
import jwt from 'jsonwebtoken';
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
  async(req, res) => {
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
 * /auth/confirm-email/{token}:
 *   get:
 *     summary: Verify a user's email using a confirmation token.
 *     description: Confirms a user's email address by decoding a JWT token and updating the user's verification status.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The email confirmation token provided to the user.
 *     responses:
 *       200:
 *         description: Email successfully verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email successfully verified!
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
router.get('/confirm-email/:token', async (req, res, next): Promise<void> => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await verifyUserEmailById(decoded.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Email successfully verified!' });
  } catch (error) {
    next(error);
  }
});
//TODO Google OAuth
export default router;
