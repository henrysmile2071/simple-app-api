import { Router } from 'express';
import {
  getUserById,
  getUserProfileById,
  updateUserNameById,
  updateUserPasswordById,
  getUsers,
  getUsersStats,
} from '../services/UserService.js';
import { validate, userPassword, userName, assertHasUser } from '../middlewares/validators.js';

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Retrieve the authenticated user's profile
 *     description: Fetches the user's details by ID from the session if the user is logged in. Requires authentication.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john.doe@example.com
 *       401:
 *         description: Unauthorized, user is not logged in
 *       500:
 *         description: Internal server error
 */
router.get('/profile', async (req, res, next): Promise<void> => {
  try {
    assertHasUser(req);
    const userProfile = await getUserProfileById(req.user.id);
    res.status(200).json(userProfile);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/name:
 *   post:
 *     summary: Update the authenticated user's name
 *     description: Allows a logged-in user to update their name.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: Successfully updated user's name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "johndoe@example.com"
 *       400:
 *         description: Bad request, invalid name provided
 *       401:
 *         description: Unauthorized, user not authenticated
 *       500:
 *         description: Internal server error
 */
router.post('/name', validate(userName), async (req, res, next): Promise<void> => {
  try {
    assertHasUser(req);
    const updatedUserProfile = await updateUserNameById(req.user.id, req.body.name);
    res.status(200).json(updatedUserProfile);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/password:
 *   post:
 *     summary: Update user password
 *     description: Allows a user to update their password after providing the current password and new password.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - newPasswordConfirmation
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The user's current password
 *                 example: Password!23
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user
 *                 example: Password!234
 *               newPasswordConfirmation:
 *                 type: string
 *                 description: Must match the new password exactly
 *                 example: Password!234
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Bad request, invalid input or password mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid password format or passwords do not match
 *       401:
 *         description: Unauthorized, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.post('/password', validate(userPassword), async (req, res, next): Promise<void> => {
  try {
    assertHasUser(req);
    const user = await getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (user?.googleId) {
      res.status(400).json({ message: 'cannot update password for Google accounts' });
      return;
    }
    const verifyPassword = user.comparePassword(req.body.currentPassword);
    if (!verifyPassword) {
      res.status(400).json({ message: 'incorrect password' });
      return;
    }
    const result = await updateUserPasswordById(req.user.id, req.body.newPassword);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Retrieve statistics about users
 *     description: Fetches total user count, active users today, and rolling 7-day average active users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved user statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   description: Total number of users in the system.
 *                   example: 1000
 *                 activeUserTodayCount:
 *                   type: integer
 *                   description: Number of users active today.
 *                   example: 150
 *                 rolling7DayAvgActiveUserCount:
 *                   type: number
 *                   description: Rolling 7-day average of active users.
 *                   example: 200
 *       500:
 *         description: Server error.
 */
router.get('/stats', async (req, res, next): Promise<void> => {
  try {
    const result = await getUsersStats();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users list
 *     description: Retrieves a list of all users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier for the user
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   name:
 *                     type: string
 *                     description: The name of the user
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     description: The email of the user
 *                     example: "johndoe@example.com"
 *                   loginCount:
 *                     type: number
 *                     description: The login count of the user
 *                     example: 0
 *                   lastActiveSession:
 *                     type: string
 *                     format: date-time
 *                     description: user last active session timestamp
 *                     example: "2023-06-15T11:24:22Z"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: When the user was created
 *                     example: "2023-05-12T14:36:22Z"
 *       401:
 *         description: Unauthorized access, user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get('/', async (req, res, next): Promise<void> => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});
export default router;
