import express, { Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { validateRequest, errorHandler, ValidationError } from '../middlewares/validation.middleware';

export const booksController = express.Router();

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  isbn: string;
  publishedYear: number;
  price: number;
  createdAt: Date;
  updatedAt?: Date;
}

const books: Record<string, Book> = {};
let bookCounter = 1;

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - description
 *         - isbn
 *         - publishedYear
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The book ID
 *         title:
 *           type: string
 *           description: The book title
 *           minLength: 1
 *           maxLength: 200
 *         author:
 *           type: string
 *           description: The book author
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: The book description
 *           minLength: 10
 *           maxLength: 2000
 *         isbn:
 *           type: string
 *           description: The book ISBN
 *           pattern: '^[0-9-]{10,13}$'
 *         publishedYear:
 *           type: integer
 *           description: The year the book was published
 *           minimum: 1800
 *           maximum: 2024
 *         price:
 *           type: number
 *           description: The book price
 *           minimum: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - description
 *               - isbn
 *               - publishedYear
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: The book title
 *                 minLength: 1
 *                 maxLength: 200
 *               author:
 *                 type: string
 *                 description: The book author
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 description: The book description
 *                 minLength: 10
 *                 maxLength: 2000
 *               isbn:
 *                 type: string
 *                 description: The book ISBN
 *                 pattern: '^[0-9-]{10,13}$'
 *               publishedYear:
 *                 type: integer
 *                 description: The year the book was published
 *                 minimum: 1800
 *                 maximum: 2024
 *               price:
 *                 type: number
 *                 description: The book price
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
booksController.post(
  '/',
  [
    body('title')
      .isString()
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('author')
      .isString()
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Author must be between 1 and 100 characters'),
    body('description')
      .isString()
      .notEmpty()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('isbn')
      .isString()
      .matches(/^[0-9-]{10,13}$/)
      .withMessage('ISBN must be 10-13 digits with optional hyphens'),
    body('publishedYear')
      .isInt({ min: 1800, max: 2024 })
      .withMessage('Published year must be between 1800 and 2024'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { title, author, description, isbn, publishedYear, price } = req.body;

      // Check if ISBN already exists
      const existingBook = Object.values(books).find(book => book.isbn === isbn);
      if (existingBook) {
        throw new ValidationError(
          'A book with this ISBN already exists',
          StatusCodes.CONFLICT,
          'DUPLICATE_ISBN'
        );
      }

      const bookId = String(bookCounter++);
      const newBook: Book = {
        id: bookId,
        title,
        author,
        description,
        isbn,
        publishedYear: Number(publishedYear),
        price: Number(price),
        createdAt: new Date()
      };

      books[bookId] = newBook;
      res.status(StatusCodes.CREATED).json(newBook);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter books by author
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Filter books by minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Filter books by maximum price
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
booksController.get(
  '/',
  [
    query('author').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { author, minPrice, maxPrice } = req.query;
      let filteredBooks = Object.values(books);

      if (author) {
        filteredBooks = filteredBooks.filter(book => 
          book.author.toLowerCase().includes(String(author).toLowerCase())
        );
      }

      if (minPrice) {
        filteredBooks = filteredBooks.filter(book => 
          book.price >= Number(minPrice)
        );
      }

      if (maxPrice) {
        filteredBooks = filteredBooks.filter(book => 
          book.price <= Number(maxPrice)
        );
      }

      res.status(StatusCodes.OK).json(filteredBooks);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/books/{bookId}:
 *   get:
 *     summary: Get a specific book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
booksController.get(
  '/:bookId',
  [
    param('bookId')
      .isString()
      .notEmpty()
      .withMessage('Book ID is required'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { bookId } = req.params;
      const book = books[bookId];

      if (!book) {
        throw new ValidationError(
          'Book not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      res.status(StatusCodes.OK).json(book);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/books/{bookId}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The book title
 *                 minLength: 1
 *                 maxLength: 200
 *               author:
 *                 type: string
 *                 description: The book author
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 description: The book description
 *                 minLength: 10
 *                 maxLength: 2000
 *               isbn:
 *                 type: string
 *                 description: The book ISBN
 *                 pattern: '^[0-9-]{10,13}$'
 *               publishedYear:
 *                 type: integer
 *                 description: The year the book was published
 *                 minimum: 1800
 *                 maximum: 2024
 *               price:
 *                 type: number
 *                 description: The book price
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
booksController.put(
  '/:bookId',
  [
    param('bookId')
      .isString()
      .notEmpty()
      .withMessage('Book ID is required'),
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('author')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Author must be between 1 and 100 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('isbn')
      .optional()
      .isString()
      .matches(/^[0-9-]{10,13}$/)
      .withMessage('ISBN must be 10-13 digits with optional hyphens'),
    body('publishedYear')
      .optional()
      .isInt({ min: 1800, max: 2024 })
      .withMessage('Published year must be between 1800 and 2024'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { bookId } = req.params;
      const book = books[bookId];

      if (!book) {
        throw new ValidationError(
          'Book not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      const { title, author, description, isbn, publishedYear, price } = req.body;

      if (isbn && isbn !== book.isbn) {
        const existingBook = Object.values(books).find(b => b.isbn === isbn);
        if (existingBook) {
          throw new ValidationError(
            'A book with this ISBN already exists',
            StatusCodes.CONFLICT,
            'DUPLICATE_ISBN'
          );
        }
      }

      if (title) book.title = title;
      if (author) book.author = author;
      if (description) book.description = description;
      if (isbn) book.isbn = isbn;
      if (publishedYear) book.publishedYear = Number(publishedYear);
      if (price) book.price = Number(price);
      book.updatedAt = new Date();

      res.status(StatusCodes.OK).json(book);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/books/{bookId}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to delete
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
booksController.delete(
  '/:bookId',
  [
    param('bookId')
      .isString()
      .notEmpty()
      .withMessage('Book ID is required'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { bookId } = req.params;
      const book = books[bookId];

      if (!book) {
        throw new ValidationError(
          'Book not found',
          StatusCodes.NOT_FOUND,
          'NOT_FOUND'
        );
      }

      delete books[bookId];
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
);

booksController.use(errorHandler);