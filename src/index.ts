import express from 'express';
import { reviewsController } from './controllers/reviews.controller'
import { booksController } from './controllers/books.controller'
import { usersController } from './controllers/users.controller'

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());

app.use('/reviews', reviewsController)
app.use('/books', booksController)
app.use('/users', usersController)

app.get('/', (req, res) => {
  res.send('Main Page');
});

app.listen(PORT, () => {
	console.log(`App is running on : http://localhost:${PORT}`);
});
