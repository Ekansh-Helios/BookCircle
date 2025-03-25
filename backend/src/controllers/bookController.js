import { pool } from '../config/db.js';
import generateUniqueId from '../../../client/src/utils/uniqueIdGenerator.js';
import { createNotification } from '../utils/notificationHelper.js';

// ✅ Get all books
export const getBooks = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const booksQuery = `
      SELECT b.*, 
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM transactions t 
            WHERE t.book_id = b.id AND t.status = 'Approved'
          ) THEN 'Unavailable'
          ELSE 'Available'
        END AS status,
        COALESCE(ROUND((SELECT AVG(r.rating) FROM reviews r WHERE r.book_id = b.id), 1), 0) AS averageRating
      FROM books b
    `;

    const [books] = await connection.query(booksQuery);

    res.json(books);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    connection.release();
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
    const { title, author, genre, description, book_condition, clubId, cover } = req.body;

    if (!cover) {
      return res.status(400).json({ error: "Book cover image URL is required." });
    }

    await connection.beginTransaction();

    const q = `
      INSERT INTO books (title, author, genre, description, book_condition, cover, unique_id, owner_id, clubId) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [title, author, genre, description, book_condition, cover, uniqueId, userId, clubId];
    const [data] = await connection.query(q, values);

    // Fetch club name
    const [clubNameResult] = await connection.query(
      `SELECT Name FROM clubs WHERE ClubID = ?`,
      [clubId]
    );
    const clubName = clubNameResult[0]?.Name || "the club";

    // 1. Notify the user who added the book
    await createNotification(userId, `You have successfully added a new book "${title}".`);

    // 2. Fetch all club members (excluding the book owner)
    const [clubMembers] = await connection.query(
      `SELECT id FROM users WHERE clubId = ? AND id != ?`,
      [clubId, userId]
    );

    for (const member of clubMembers) {
      await createNotification(member.id, `A new book "${title}" has been added to your club "${clubName}".`);
    }

    // 3. Notify the Super Admin
    const [superAdmin] = await connection.query(
      `SELECT id FROM users WHERE userType = 'superAdmin' LIMIT 1`
    );

    if (superAdmin.length > 0) {
      await createNotification(superAdmin[0].id, `A new book "${title}" has been added to the club "${clubName}".`);
    }

    await connection.commit();
    res.status(201).json({ message: "Book added successfully", bookId: data.insertId });

  } catch (err) {
    await connection.rollback();
    console.error("Error adding book:", err);
    res.status(500).json({ error: "An error occurred while adding the book. Please try again." });
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
// For getting book details on Book Details page
export const getBookDetails = async (req, res) => {
  const { bookId } = req.params;
  const connection = await pool.getConnection();

  try {
    // Fetch book details and club name
    const [bookDetails] = await connection.query(
      `SELECT b.id, b.title, b.author, b.genre, b.description, b.owner_id, 
              b.book_condition, b.cover, c.Name AS clubName
       FROM books b
       JOIN clubs c ON b.clubId = c.ClubID
       WHERE b.id = ?`,
      [bookId]
    );

    if (bookDetails.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const book = bookDetails[0];

    // Determine book availability
    const [[{ activeTransactions }]] = await connection.query(
      `SELECT COUNT(*) AS activeTransactions
       FROM transactions
       WHERE book_id = ? AND status IN ('Approved', 'Borrowed')`,
      [bookId]
    );

    const availability = activeTransactions === 0 ? "Available" : "Not Available";

    // Fetch average rating safely
    const [[ratingData]] = await connection.query(
      `SELECT AVG(rating) AS averageRating
       FROM reviews
       WHERE book_id = ?`,
      [bookId]
    );

    // Ensure averageRating is always a valid number
    const averageRating = ratingData?.averageRating !== null ? Number(ratingData.averageRating).toFixed(1) : "0.0";

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
    console.error("❌ Error fetching book details:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    connection.release();
  }
};
