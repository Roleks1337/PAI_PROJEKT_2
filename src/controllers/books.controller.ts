import express from 'express'
import { StatusCodes } from "http-status-codes";

export const booksController = express.Router();

interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
}

let books: Book[] = [];
let currentId = 1;

const validateBookMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { title, author, year } = req.body;

  if (!title || !author || !year) {
    res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Missing required fields: title, author, and year are required' 
    });
    return;
  }

  if (typeof year !== 'number' || year < 0 || year > new Date().getFullYear()) {
    res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Year must be a valid number between 0 and current year' 
    });
    return;
  }

  next();
};


booksController.post('/books', validateBookMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const { title, author, year } = req.body;
    const newBook: Book = {
      id: currentId++,
      title,
      author,
      year
    };

    books.push(newBook);
    res.status(StatusCodes.CREATED).json(newBook);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error creating book' 
    });
  }
});


booksController.get('/books', (req: express.Request, res: express.Response) => {
  try {
    let filteredBooks = [...books];
    const { author, year } = req.query;

    if (author) {
      filteredBooks = filteredBooks.filter(book => 
        book.author.toLowerCase().includes(author.toString().toLowerCase())
      );
    }

    if (year) {
      filteredBooks = filteredBooks.filter(book => 
        book.year === parseInt(year.toString())
      );
    }

    res.status(StatusCodes.OK).json(filteredBooks);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error fetching books' 
    });
  }
});


booksController.get('/books/:id', (req: express.Request, res: express.Response) => {
  try {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);

    if (!book) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      return;
    }

    res.status(StatusCodes.OK).json(book);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error fetching book' 
    });
  }
});


booksController.put('/books/:id', validateBookMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const bookId = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === bookId);

    if (index === -1) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      return;
    }

    const { title, author, year } = req.body;
    const updatedBook = {
      ...books[index],
      title,
      author,
      year
    };

    books[index] = updatedBook;
    res.status(StatusCodes.OK).json(updatedBook);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error updating book' 
    });
  }
});


booksController.delete('/books/:id', (req: express.Request, res: express.Response) => {
  try {
    const bookId = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === bookId);

    if (index === -1) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      return;
    }

    books.splice(index, 1);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error deleting book' 
    });
  }
});