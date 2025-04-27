import express from 'express'
import { StatusCodes } from "http-status-codes";

export const reviewsController = express.Router();

// MAKSIU
    reviewsController.post('/books/:bookid/reviews', (req,res) => {
    //PISZ TU KOD
  })
  
  reviewsController.get('/books/:bookid/reviews', (req,res) => {
    //PISZ TU KOD
  })
  
  reviewsController.get('/reviews/:reviewId', (req,res) => {
    //PISZ TU KOD
  }) 
  
  reviewsController.put('/reviews/:reviewId', (req,res) => {
    //PISZ TU KOD
  }) 
  
  reviewsController.delete('/reviews/:reviewId', (req,res) => {
    //PISZ TU KOD
  }) 
