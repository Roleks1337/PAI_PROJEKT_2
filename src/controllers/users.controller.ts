import express, { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { validateRequest, errorHandler, ValidationError } from '../middlewares/validation.middleware';

export const usersController = express.Router();

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}

// In-memory storage (replace with database in production)
const users: Record<string, User> = {};
let userCounter = 1;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID
 *         username:
 *           type: string
 *           description: The username
 *           minLength: 3
 *           maxLength: 50
 *         email:
 *           type: string
 *           description: The email address
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 description: The email address
 *                 format: email
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
usersController.post(
  '/',
  [
    body('username')
      .isString()
      .notEmpty()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters'),
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { username, email } = req.body;

      // Check if email already exists
      const existingUser = Object.values(users).find(user => user.email === email);
      if (existingUser) {
        throw new ValidationError(
          'A user with this email already exists',
          StatusCodes.CONFLICT,
          'DUPLICATE_EMAIL'
        );
      }

      const userId = String(userCounter++);
      const newUser: User = {
        id: userId,
        username,
        email,
        createdAt: new Date()
      };

      users[userId] = newUser;
      res.status(StatusCodes.CREATED).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
usersController.get(
  '/',
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.status(StatusCodes.OK).json(Object.values(users));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersController.get(
  '/:userId',
  [
    param('userId')
      .isString()
      .notEmpty()
      .withMessage('User ID is required'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { userId } = req.params;
      const user = users[userId];

      if (!user) {
        throw new ValidationError(
          'User not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      res.status(StatusCodes.OK).json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 description: The email address
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersController.put(
  '/:userId',
  [
    param('userId')
      .isString()
      .notEmpty()
      .withMessage('User ID is required'),
    body('username')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { userId } = req.params;
      const user = users[userId];

      if (!user) {
        throw new ValidationError(
          'User not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      const { username, email } = req.body;

      if (email && email !== user.email) {
        const existingUser = Object.values(users).find(u => u.email === email);
        if (existingUser) {
          throw new ValidationError(
            'A user with this email already exists',
            StatusCodes.CONFLICT,
            'DUPLICATE_EMAIL'
          );
        }
      }

      if (username) user.username = username;
      if (email) user.email = email;
      user.updatedAt = new Date();

      res.status(StatusCodes.OK).json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersController.delete(
  '/:userId',
  [
    param('userId')
      .isString()
      .notEmpty()
      .withMessage('User ID is required'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { userId } = req.params;
      const user = users[userId];

      if (!user) {
        throw new ValidationError(
          'User not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      delete users[userId];
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
);

usersController.use(errorHandler);
