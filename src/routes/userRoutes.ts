import { Router } from 'express';
import { getUserProfileById } from '@services/UserService';
import { ensureAuthenticated } from '@middlewares/helpers';
import { User } from '@entities/User';

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
 *                 id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john.doe@example.com
 *                 isEmailVerified:
 *                   type: boolean
 *                   example: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-04T10:00:00Z"
 *       401:
 *         description: Unauthorized, user is not logged in
 *       500:
 *         description: Internal server error
 */
router.get('/profile', ensureAuthenticated, async (req, res, next): Promise<void> => {
  try {
      assertHasUser(req);
      const user = await getUserProfileById(req.user.id);
      res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

//TODO Update user name
//TODO Update user password
//TODO Get user list
//TODO Get user statistics

export default router;
