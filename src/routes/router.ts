import { Router } from 'express';
import { reviewsController } from '../controllers/reviews.controller';
import { booksController } from '../controllers/books.controller';
import { usersController } from '../controllers/users.controller';

const router = Router();

router.use('/reviews', reviewsController);

router.use('/books', booksController);

router.use('/users', usersController);

export default router;