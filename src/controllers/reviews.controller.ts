import express from 'express'
import { StatusCodes } from "http-status-codes";

export const reviewsController = express.Router();

interface Review {
  id: number;
  bookId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

let reviews: Review[] = [];
let currentId = 1;

const validateReviewMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { userId, rating, comment } = req.body;

  if (!userId || !rating || !comment) {
    res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Missing required fields: userId, rating, and comment are required' 
    });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Rating must be between 1 and 5' 
    });
    return;
  }

  next();
};

reviewsController.post('/books/:bookid/reviews', validateReviewMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const bookId = parseInt(req.params.bookid);
    const { userId, rating, comment } = req.body;

    const newReview: Review = {
      id: currentId++,
      bookId,
      userId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    res.status(StatusCodes.CREATED).json(newReview);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error creating review' 
    });
  }
});

reviewsController.get('/books/:bookid/reviews', (req: express.Request, res: express.Response) => {
  try {
    const bookId = parseInt(req.params.bookid);
    const bookReviews = reviews.filter(review => review.bookId === bookId);
    res.status(StatusCodes.OK).json(bookReviews);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error fetching reviews' 
    });
  }
});

reviewsController.get('/reviews/:reviewId', (req: express.Request, res: express.Response) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const review = reviews.find(r => r.id === reviewId);

    if (!review) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Review not found' });
      return;
    }

    res.status(StatusCodes.OK).json(review);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error fetching review' 
    });
  }
});

reviewsController.put('/reviews/:reviewId', validateReviewMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const index = reviews.findIndex(r => r.id === reviewId);

    if (index === -1) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Review not found' });
      return;
    }

    const { rating, comment } = req.body;
    const updatedReview = {
      ...reviews[index],
      rating,
      comment
    };

    reviews[index] = updatedReview;
    res.status(StatusCodes.OK).json(updatedReview);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error updating review' 
    });
  }
});

reviewsController.delete('/reviews/:reviewId', (req: express.Request, res: express.Response) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const index = reviews.findIndex(r => r.id === reviewId);

    if (index === -1) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Review not found' });
      return;
    }

    reviews.splice(index, 1);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error deleting review' 
    });
  }
});
