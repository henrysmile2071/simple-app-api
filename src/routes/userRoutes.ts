import { Router } from 'express';
import { getUserById, getUserProfileById, updateUserNameById, updateUserPasswordById } from '@services/UserService';
import { validate, userPassword, userName } from '@middlewares/validators';
import { assertHasUser } from '@customTypes/custom';

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
 *     description: Allows a logged-in user to update their name. Validates the input using Typia and updates the user's name in the database.
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
    const verifyPassword = await (await getUserById(req.user.id))?.comparePassword(req.body.currentPassword);
    if (!verifyPassword) {
      res.status(400).json({ message: 'incorrect password' });
      return
    }
    const result = await updateUserPasswordById(req.user.id, req.body.newPassword);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
//TODO Get user list
//TODO Get user statistics

export default router;
