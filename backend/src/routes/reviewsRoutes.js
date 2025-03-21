import express from 'express';
import { 
  addReview, 
  getBookReviews, 
  editReview, 
  approveReview 
} from '../controllers/reviewsController.js';
import { authenticateUser } from "../middleware/authenticateUser.js";

const router = express.Router();

// Add a review (requires login)
router.post('/add', authenticateUser, addReview);

// Get all reviews for a specific book
router.get('/book/:bookId', getBookReviews);

// Edit a review (requires login)
router.put('/edit/:reviewId', authenticateUser, editReview);

// Approve a review (admin only)
router.put('/approve/:reviewId', authenticateUser, approveReview);

export default router;
