import express, { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { validateRequest, errorHandler, ValidationError } from '../middlewares/validation.middleware';

export const reviewsController = express.Router();

interface Review {
  id: string;
  bookId: string;
  userId: string;
  text: string;
  rating: number;
  createdAt: Date;
  updatedAt?: Date;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

const reviews: Record<string, Review> = {};
const bookReviews: Record<string, string[]> = {};
let reviewCounter = 1;

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - bookId
 *         - userId
 *         - text
 *         - rating
 *       properties:
 *         id:
 *           type: string
 *           description: The review ID
 *         bookId:
 *           type: string
 *           description: The book ID
 *         userId:
 *           type: string
 *           description: The user ID
 *         text:
 *           type: string
 *           description: The review text
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: object
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - userId
 *               - text
 *               - rating
 *             properties:
 *               bookId:
 *                 type: string
 *               userId:
 *                 type: string
 *               text:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
reviewsController.post(
  '/',
  [
    body('bookId').isString().notEmpty(),
    body('userId').isString().notEmpty(),
    body('text').isString().notEmpty().trim().isLength({ min: 10, max: 1000 }),
    body('rating').isInt({ min: 1, max: 5 }),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { bookId, userId, text, rating } = req.body;

      const reviewId = String(reviewCounter++);
      const newReview: Review = {
        id: reviewId,
        bookId,
        userId,
        text,
        rating: Number(rating),
        createdAt: new Date()
      };

      reviews[reviewId] = newReview;
      bookReviews[bookId] = bookReviews[bookId] || [];
      bookReviews[bookId].push(reviewId);

      res.status(StatusCodes.CREATED).json(newReview);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/reviews/book/{bookId}:
 *   get:
 *     summary: Get all reviews for a book
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
reviewsController.get(
  '/book/:bookId',
  [param('bookId').isString().notEmpty(), validateRequest],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { bookId } = req.params;
      const reviewIds = bookReviews[bookId] || [];
      const bookReviewsList = reviewIds.map(id => reviews[id]);
      res.status(StatusCodes.OK).json(bookReviewsList);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   get:
 *     summary: Get a specific review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
reviewsController.get(
  '/:reviewId',
  [param('reviewId').isString().notEmpty(), validateRequest],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { reviewId } = req.params;
      const review = reviews[reviewId];

      if (!review) {
        throw new ValidationError(
          'Review not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      res.status(StatusCodes.OK).json(review);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
reviewsController.put(
  '/:reviewId',
  [
    param('reviewId').isString().notEmpty(),
    body('text').optional().isString().trim().isLength({ min: 10, max: 1000 }),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { reviewId } = req.params;
      const review = reviews[reviewId];

      if (!review) {
        throw new ValidationError(
          'Review not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      const { text, rating } = req.body;
      if (text) review.text = text;
      if (rating) review.rating = Number(rating);
      review.updatedAt = new Date();

      res.status(StatusCodes.OK).json(review);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
reviewsController.delete(
  '/:reviewId',
  [param('reviewId').isString().notEmpty(), validateRequest],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { reviewId } = req.params;
      const review = reviews[reviewId];

      if (!review) {
        throw new ValidationError(
          'Review not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      delete reviews[reviewId];
      bookReviews[review.bookId] = bookReviews[review.bookId].filter(
        id => id !== reviewId
      );

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
);

reviewsController.use(errorHandler);
