import express from 'express';
import {
  getAllTransactions,
  getUserTransactions,
  createTransaction,
  updateTransactionStatus,
  deleteTransaction,
  getUserRequestedBooks,
  getRequestsReceived,
  approveRequest,
  rejectRequest,
  getBorrowedBooksByUser,
  requestBook,
  returnBook,
  getSuccessfulTransactions
} from '../controllers/transactionController.js';
import { authenticateUser, authorizeAdmin } from '../middleware/authenticateUser.js';

const router = express.Router();

// Get all transactions (Admin only)
// router.get('/all', authenticateUser, authorizeAdmin, getAllTransactions);

// Get transactions for the logged-in user
// router.get('/user', authenticateUser, getUserTransactions);

// Create a new borrow request
router.post('/borrow', authenticateUser, createTransaction);

// Get list of all books requested by the user
router.get('/requested/:userId', authenticateUser, getUserRequestedBooks);

// Get requests received by the logged-in user (owner of books)
router.get("/received/:userId", authenticateUser, getRequestsReceived);

// Approve borrow request
router.put("/approve/:transactionId", authenticateUser, approveRequest);

// Reject borrow request
router.put("/reject/:transactionId", authenticateUser, rejectRequest);


// Fetch Borrowed Books for a User
router.get('/borrowed/:userId', authenticateUser, getBorrowedBooksByUser);

// For requesting a unavailable book
router.post("/request", authenticateUser, requestBook);

// Return book route
router.put('/return/:transactionId', authenticateUser, returnBook);

// Get all successful transactions for a club
router.get('/successful/:clubId', getSuccessfulTransactions);

// Update transaction status (Approve, Return, Cancel)
// router.patch('/:id/status', authenticateUser, updateTransactionStatus);

// Delete a transaction (Admin only)
// router.delete('/:id', authenticateUser, authorizeAdmin, deleteTransaction);

export default router;
