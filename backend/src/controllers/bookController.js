import { pool } from '../config/db.js';
import generateUniqueId from '../../../client/src/utils/uniqueIdGenerator.js';
import { createNotification } from '../utils/notificationHelper.js';

// ✅ Get all books
export const getBooks = async (req, res) => {
  const q = `
    SELECT b.*, 
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM transactions t 
          WHERE t.book_id = b.id AND t.status = 'Approved'
        ) THEN 'Unavailable'
        ELSE 'Available'
      END AS status
    FROM books b
  `;

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
    // console.log("User ID:", userId);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    // Fetch books for the logged-in user
    const q = "SELECT * FROM books WHERE owner_id = ?";
    const [data] = await pool.query(q, [userId]);

    // ✅ Always return 200, even if no books
    res.json({ books: data }); // 'books' will be empty array if none

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
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const uniqueId = await generateUniqueId();

    const { title, author, genre, description, book_condition, clubId } = req.body;
    const cover = req.file ? `/uploads/${req.file.filename}` : null;

    await connection.beginTransaction();

    const q = `
      INSERT INTO books (title, author, genre, description, book_condition, cover, unique_id, owner_id, clubId) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [title, author, genre, description, book_condition, cover, uniqueId, userId, clubId];
    const [data] = await connection.query(q, values);

    // 1. Notify the user who added the book
    await createNotification(userId, `You have successfully added a new book "${title}".`);

    // 2. Fetch all club members
    const [clubMembers] = await connection.query(
      `SELECT id FROM users WHERE clubId = ?`,
      [clubId]
    );

    // Notify each club member (excluding the user who added the book if needed)
    for (const member of clubMembers) {
      if (member.id !== userId) {
        await createNotification(member.id, `A new book "${title}" has been added to your club.`);
      }
    }

    // 3. Notify the Super Admin
    const [superAdmin] = await connection.query(
      `SELECT id FROM users WHERE userType = 'superAdmin' LIMIT 1`
    );

    const [clubNameResult] = await connection.query(
      `SELECT Name FROM clubs WHERE ClubID = ?`, [clubId]
    );
    const clubName = clubNameResult[0]?.Name || 'the club';
    
    console.log(clubName);
    if (superAdmin.length > 0) {
      await createNotification(superAdmin[0].id, `A new book "${title}" has been added in the club "${clubName}".`);
    }

    await connection.commit();
    res.status(201).json({ message: "Book added successfully", bookId: data.insertId });
  } catch (err) {
    await connection.rollback();
    console.error("Error adding book:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    connection.release();
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

// For getting book details on Book Details page
export const getBookDetails = async (req, res) => {
  const { bookId } = req.params;
  const connection = await pool.getConnection();
  try {
    // Fetch book details and club name
    const [bookDetails] = await connection.query(
      `SELECT b.id, b.title, b.author, b.genre, b.description, b.owner_id, b.book_condition, b.cover, c.Name AS clubName
       FROM books b
       JOIN clubs c ON b.clubId = c.ClubID
       WHERE b.id = ?`,
      [bookId]
    );

    if (bookDetails.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const book = bookDetails[0];

    // Determine availability
    const [activeTransactions] = await connection.query(
      `SELECT COUNT(*) AS activeTransactions
       FROM transactions
       WHERE book_id = ? AND status IN ('Approved', 'Borrowed')`,
      [bookId]
    );

    const availability = activeTransactions[0].activeTransactions === 0 ? "Available" : "Not Available";

    // Calculate average rating
    const [ratingData] = await connection.query(
      `SELECT AVG(rating) AS averageRating
       FROM reviews
       WHERE book_id = ?`,
      [bookId]
    );

    const averageRating = ratingData[0].averageRating ? parseFloat(ratingData[0].averageRating.toFixed(2)) : null;

    // Fetch reviews
    const [reviews] = await connection.query(
      `SELECT r.reviewId, r.user_id AS userId, u.name, r.rating, r.comment, r.date
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.book_id = ?
       ORDER BY r.date DESC`,
      [bookId]
    );

    res.status(200).json({
      ...book,
      availability,
      averageRating,
      reviews
    });
  } catch (err) {
    console.error("Error fetching book details:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    connection.release();
  }
};
