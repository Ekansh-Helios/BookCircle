import { pool } from '../config/db.js';
import generateUniqueId from '../../../client/src/utils/uniqueIdGenerator.js';

// ✅ Get all books
export const getBooks = async (req, res) => {
  const q = "SELECT * FROM books";
  try {
    const [data] = await pool.query(q);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ✅ Get books added by the logged-in user
export const getUserBooks = async (req, res) => {
  try {
    // Ensure user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    // Fetch books for the logged-in user
    const q = "SELECT * FROM books WHERE owner_id = ?";
    const [data] = await pool.query(q, [userId]);

    if (data.length === 0) {
      return res.status(404).json({ error: "No books found for this user" });
    }

    res.json({ books: data });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// ✅ Get book by ID
export const getBookById = async (req, res) => {
  const bookId = req.params.id;
  const q = "SELECT * FROM books WHERE id = ?";
  try {
    const [data] = await pool.query(q, [bookId]);
    if (data.length === 0) return res.status(404).json({ error: "Book not found" });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
};

// ✅ Create a new book
export const createBook = async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in user ID
    const uniqueId = await generateUniqueId();

    // Extract book details from request body
    const { title, author, genre, description, book_condition } = req.body;
    const cover = req.file ? `/uploads/${req.file.filename}` : null; // Handle image upload

    const q = `
      INSERT INTO books (title, author, genre, description, book_condition, cover, unique_id, owner_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [title, author, genre, description, book_condition, cover, uniqueId, userId];

    const [data] = await pool.query(q, values);
    res.status(201).json({ message: "Book added successfully", bookId: data.insertId });
  } catch (err) {
    console.error("Error adding book:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// ✅ Update an existing book
export const updateBook = async (req, res) => {
  const bookId = req.params.id;
  const { title, author, genre, description, book_condition } = req.body;
  const cover_image = req.file ? `/uploads/${req.file.filename}` : null; // Optional image update

  try {
    const q = `
      UPDATE books 
      SET title = ?, author = ?, genre = ?, description = ?, book_condition = ?, cover = ?
      WHERE id = ?
    `;
    const values = [title, author, genre, description, book_condition, cover_image, bookId];

    const [data] = await pool.query(q, values);
    if (data.affectedRows === 0) return res.status(404).json({ error: "Book not found" });

    res.json({ message: "Book updated successfully" });
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// ✅ Delete a book
export const deleteBook = async (req, res) => {
  const bookId = req.params.id;
  const q = "DELETE FROM books WHERE id = ?";
  try {
    const [data] = await pool.query(q, [bookId]);
    if (data.affectedRows === 0) return res.status(404).json({ error: "Book not found" });

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ error: "Database error" });
  }
};
