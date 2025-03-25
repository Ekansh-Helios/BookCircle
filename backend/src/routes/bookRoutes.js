import express from 'express';
import { 
    getBooks, 
    getBookById, 
    createBook, 
    deleteBook, 
    updateBook, 
    getUserBooks, 
    getBookDetails 
} from '../controllers/bookController.js';
import { authenticateUser } from '../middleware/authenticateUser.js'; 

const router = express.Router();

// ✅ Public Routes (No Authentication Required)
router.get('/', getBooks); 
router.get('/my-books', authenticateUser, getUserBooks); // Fetch books added by the logged-in user
router.get('/:bookId', getBookDetails);

// ✅ Protected Routes (Requires Authentication)
router.post('/', authenticateUser, createBook); // Add a new book (image URL instead of file upload)
router.put('/:id', authenticateUser, updateBook); // Update book details
router.delete('/:id', authenticateUser, deleteBook); // Delete a book

export default router;
