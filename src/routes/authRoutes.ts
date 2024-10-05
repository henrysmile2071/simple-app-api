import { Router } from 'express';
import passport from '@config/passport';
import { signup } from '@controllers/authController';
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
 *                 example: password123
 *               passwordConfirmation:
 *                 type: string
 *                 description: The user's password confirmation
 *                 example: password123
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
router.post('/signup', signup);

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
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login.
 *         headers:
 *           Set-Cookie:
 *             description: Sets a session cookie after successful login.
 *             schema:
 *               type: string
 *       401:
 *         description: Invalid credentials (Unauthorized).
 */
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: "/error" }), (req, res) => {
  res.send("login success");
});

//TODO Logout
//TODO Google OAuth

export default router;
