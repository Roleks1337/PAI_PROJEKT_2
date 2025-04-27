import express from 'express'
import { StatusCodes } from "http-status-codes";

export const usersController = express.Router();

// JA
  usersController.post('/books/:bookid/reviews', (req,res) => {

  })
  
  usersController.get('/books/:bookid/reviews', (req,res) => {

  })
  
  usersController.get('/reviews/:reviewId', (req,res) => {

  }) 
  
  usersController.put('/reviews/:reviewId', (req,res) => {

  }) 
  
  usersController.delete('/reviews/:reviewId', (req,res) => {

  }) 
