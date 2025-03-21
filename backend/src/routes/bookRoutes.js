import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
    getBooks, 
    getBookById, 
    createBook, 
    deleteBook, 
    updateBook, 
    getUserBooks, 
    getBookDetails
} from '../controllers/bookController.js';
import {authenticateUser} from '../middleware/authenticateUser.js'; // ✅ Import authentication middleware

// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ✅ Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

// ✅ Define routes
router.get('/', getBooks);
router.get('/my-books', authenticateUser, getUserBooks); // ✅ New route for fetching user’s books
// router.get('/:id', getBookById);
router.get('/:bookId', getBookDetails);

// ✅ Protected Routes (Requires authentication)
router.post('/', authenticateUser, upload.single('cover'), createBook);
router.put('/:id', authenticateUser, upload.single('cover'), updateBook);
router.delete('/:id', authenticateUser, deleteBook);

export default router;
