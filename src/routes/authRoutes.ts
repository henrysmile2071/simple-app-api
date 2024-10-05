import { Router } from 'express';
import passport from '@config/passport';
import { registerUser, getUserByEmail } from '@services/UserService'; 
import { passwordValidator } from 'src/middlewares/validators';

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
router.post('/signup', async (req, res): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email ||!password) {
      res.status(400).send('Missing email or password');
      return;
    }
    if (!passwordValidator(password)) { 
      res.status(400).send('Invalid password format');
      return;
    }
    if (req.body.password !== req.body.passwordConfirmation) {
      res.status(400).send('Passwords do not match');
      return;
    }
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const newUser = await registerUser(email, password);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
 *       302:
 *         description: Redirects to the home page on success, or to login page on failure.
 */
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: "/error" }), (req, res) => {
  res.redirect('/');
});

export default router;
