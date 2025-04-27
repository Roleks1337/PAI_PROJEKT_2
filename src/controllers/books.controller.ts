import express from 'express'
import { StatusCodes } from "http-status-codes";

export const booksController = express.Router();

// WIKTORIA
    booksController.post('/books/:bookid/reviews', (req,res) => {
    //PISZ TU KOD
  })
  
  booksController.get('/books/:bookid/reviews', (req,res) => {
    //PISZ TU KOD
  })
  
  booksController.get('/reviews/:reviewId', (req,res) => {
    //PISZ TU KOD
  }) 
  
  booksController.put('/reviews/:reviewId', (req,res) => {
    //PISZ TU KOD
  }) 
  
  booksController.delete('/reviews/:reviewId', (req,res) => {
    //PISZ TU KOD
  }) 
