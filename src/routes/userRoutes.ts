import { Router } from 'express';
import { getUserProfileById, updateUserNameById } from '@services/UserService';
import { User } from '@entities/User';
import { body, validationResult } from 'express-validator';

type RequestWithUser = Express.Request & { user: User };
function assertHasUser(req: Express.Request): asserts req is RequestWithUser {
  if (!('user' in req)) {
    throw new Error('Request object without user found unexpectedly');
  }
}

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
router.post('/name', body('name').isString(), async (req, res, next): Promise<void> => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      assertHasUser(req);
      const updatedUserProfile = await updateUserNameById(req.user.id, req.body.name);
      res.status(200).json(updatedUserProfile);
      return
    }
    res.status(400).json(result.array());
  } catch (error) {
    next(error);
  }
});
//TODO Update user password
//TODO Get user list
//TODO Get user statistics

export default router;
