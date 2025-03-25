import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
import { createNotification } from '../utils/notificationHelper.js';

// ✅ Get all transactions (for admin/debugging purposes)
export const getAllTransactions = async (req, res) => {
    try {
        const q = `
      SELECT transactions.*, books.title AS bookTitle, users.name AS borrowerName
      FROM transactions
      JOIN books ON transactions.bookId = books.id
      JOIN users ON transactions.borrowerId = users.id
    `;
        const [data] = await pool.query(q);
        res.json(data);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// ✅ Get transactions for logged-in user (Borrowed & Requested)
export const getUserTransactions = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const q = `
      SELECT transactions.*, books.title AS bookTitle
      FROM transactions
      JOIN books ON transactions.bookId = books.id
      WHERE borrowerId = ?
    `;
        const [data] = await pool.query(q, [userId]);
        res.json(data);
    } catch (err) {
        console.error("Error fetching user's transactions:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// ✅ Create a borrow request
export const createTransaction = async (req, res) => {
    try {
        const { bookId, ownerId } = req.body;
        const borrowerId = req.user?.id;

        if (!borrowerId) return res.status(401).json({ error: "Unauthorized" });
        if (!bookId || !ownerId) return res.status(400).json({ error: "Missing bookId or ownerId" });

        const requestDate = moment().format("YYYY-MM-DD HH:mm:ss");
        const transactionId = uuidv4();

        await pool.query(
            `INSERT INTO transactions 
             (transaction_id, book_id, borrower_id, owner_id, current_holder_id, status, request_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [transactionId, bookId, borrowerId, ownerId, ownerId, 'Requested', requestDate]
        );

        // Fetch book title
        const [bookRows] = await pool.query(`SELECT title FROM books WHERE id = ?`, [bookId]);
        const bookTitle = bookRows.length > 0 ? bookRows[0].title : 'a book';

        // Notify the owner about the new borrow request
        await createNotification(ownerId, `You have a new borrow request for "${bookTitle}".`);

        res.status(201).json({ message: "Borrow request created successfully", transactionId });
    } catch (err) {
        console.error("Error creating transaction:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// ✅ Update transaction status (Approve, Return, Cancel)
export const updateTransactionStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Approved", "Returned", "Overdue", "Canceled"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const q = "UPDATE transactions SET status = ? WHERE id = ?";
        const [result] = await pool.query(q, [status, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Transaction not found" });

        res.json({ message: `Transaction ${status} successfully` });
    } catch (err) {
        console.error("Error updating transaction:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// ✅ Delete a transaction (Optional, mostly for admin)
export const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        const q = "DELETE FROM transactions WHERE id = ?";
        const [result] = await pool.query(q, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Transaction not found" });

        res.json({ message: "Transaction deleted successfully" });
    } catch (err) {
        console.error("Error deleting transaction:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// ✅ Get all books requested by the user
export const getUserRequestedBooks = async (req, res) => {
    try {
        const userId = req.params.userId;

        const q = `
        SELECT t.id, t.status, t.request_date, t.due_date,
               b.id AS book_id, b.title, b.author, b.cover
        FROM transactions t
        INNER JOIN books b ON t.book_id = b.id
        WHERE t.borrower_id = ? AND t.status = 'Requested'
        ORDER BY t.request_date DESC
      `;

        const [results] = await pool.query(q, [userId]);

        const requestedBooks = results.map(row => ({
            id: row.id,
            status: row.status,
            request_date: row.request_date,
            due_date: row.due_date,
            book: {
                id: row.book_id,
                title: row.title,
                author: row.author,
                cover: row.cover,
            },
        }));

        res.status(200).json(requestedBooks);
    } catch (err) {
        console.error("Error fetching requested books:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// ✅ Get Requests Received by Book Owner
export const getRequestsReceived = async (req, res) => {
    try {
        const ownerId = req.params.userId;

        const q = `
        SELECT t.id, t.status, t.request_date, t.due_date,
               b.id AS book_id, b.title, b.author, b.cover
        FROM transactions t
        INNER JOIN books b ON t.book_id = b.id
        WHERE t.owner_id = ? AND t.status = 'Requested'
        ORDER BY t.request_date DESC
      `;

        const [results] = await pool.query(q, [ownerId]);

        const receivedRequests = results.map(row => ({
            id: row.id,
            status: row.status,
            request_date: row.request_date,
            due_date: row.due_date,
            book: {
                id: row.book_id,
                title: row.title,
                author: row.author,
                cover: row.cover,
            },
        }));

        res.status(200).json(receivedRequests);
    } catch (err) {
        console.error("Error fetching received requests:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// ✅ Approve Borrow Request
export const approveRequest = async (req, res) => {
    let connection;
    try {
        const transactionId = req.params.transactionId;
        connection = await pool.getConnection();

        await connection.beginTransaction();

        // Approve the selected request
        const approveQuery = `
            UPDATE transactions 
            SET status = 'Approved', due_date = DATE_ADD(NOW(), INTERVAL 14 DAY), approval_date = NOW()
            WHERE id = ? AND status = 'Requested'
        `;
        const [approveResult] = await connection.query(approveQuery, [transactionId]);

        if (approveResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Request not found or already processed" });
        }

        // Get book_id and borrower_id
        const [[transactionRow]] = await connection.query(
            `SELECT book_id, borrower_id FROM transactions WHERE id = ?`,
            [transactionId]
        );
        const { book_id: bookId, borrower_id: borrowerId } = transactionRow;

        // Cancel other pending requests
        const cancelQuery = `
            UPDATE transactions 
            SET status = 'Cancelled' 
            WHERE book_id = ? AND status = 'Requested' AND id != ?
        `;
        await connection.query(cancelQuery, [bookId, transactionId]);

        // Fetch book title
        const [[bookRow]] = await connection.query(
            `SELECT title FROM books WHERE id = ?`,
            [bookId]
        );
        const bookTitle = bookRow ? bookRow.title : "a book";

        await createNotification(borrowerId, `Your request for the book "${bookTitle}" has been accepted.`);

        await connection.commit();
        res.status(200).json({ message: "Request approved and other requests for this book are canceled." });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Error approving request:", err);
        res.status(500).json({ error: "Database error" });
    } finally {
        if (connection) connection.release();
    }
};




// ✅ Reject Borrow Request
export const rejectRequest = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const transactionId = req.params.transactionId;

        await connection.beginTransaction();

        // Reject the request
        const q = `UPDATE transactions SET status = 'Cancelled' WHERE id = ? AND status = 'Requested'`;
        const [result] = await connection.query(q, [transactionId]);
        if (result.affectedRows === 0) {
            await connection.release();
            return res.status(404).json({ error: "Request not found or already processed" });
        }

        // Get book_id and borrower_id from the transaction
        const [transactionRows] = await connection.query(`SELECT book_id, borrower_id FROM transactions WHERE id = ?`, [transactionId]);
        const bookId = transactionRows[0].book_id;
        const borrowerId = transactionRows[0].borrower_id;

        // Fetch book title
        const [bookRows] = await connection.query(`SELECT title FROM books WHERE id = ?`, [bookId]);
        const bookTitle = bookRows.length > 0 ? bookRows[0].title : 'a book';

        // Create notification for borrower
        await createNotification(borrowerId, `Your request for the book "${bookTitle}" has been rejected.`);

        await connection.commit();
        await connection.release();

        res.status(200).json({ message: "Request rejected successfully" });
    } catch (err) {
        await connection.rollback();
        await connection.release();
        console.error("Error rejecting request:", err);
        res.status(500).json({ error: "Database error" });
    }
};


// ✅ Get Borrowed Books for a User (Borrowed on Top, Returned Below)
export const getBorrowedBooksByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Query for currently borrowed books (status = 'Approved')
        const borrowedQuery = `
        SELECT t.id AS transaction_id, t.status, t.request_date, t.due_date,
               b.id AS book_id, b.title, b.author, b.cover
        FROM transactions t
        INNER JOIN books b ON t.book_id = b.id
        WHERE t.borrower_id = ? AND t.status = 'Approved'
        ORDER BY t.request_date DESC
        `;

        // Query for returned books (status = 'Returned')
        const returnedQuery = `
        SELECT t.id AS transaction_id, t.status, t.request_date, t.return_date,
               b.id AS book_id, b.title, b.author, b.cover
        FROM transactions t
        INNER JOIN books b ON t.book_id = b.id
        WHERE t.borrower_id = ? AND t.status = 'Returned'
        ORDER BY t.return_date DESC
        `;

        // Execute queries
        const [borrowedResults] = await pool.query(borrowedQuery, [userId]);
        const [returnedResults] = await pool.query(returnedQuery, [userId]);

        // Format response
        const borrowedBooks = borrowedResults.map(row => ({
            transaction_id: row.transaction_id,
            status: row.status,
            request_date: row.request_date,
            due_date: row.due_date,
            book: {
                id: row.book_id,
                title: row.title,
                author: row.author,
                cover: row.cover,
            },
        }));

        const returnedBooks = returnedResults.map(row => ({
            transaction_id: row.transaction_id,
            status: row.status,
            request_date: row.request_date,
            return_date: row.return_date,
            book: {
                id: row.book_id,
                title: row.title,
                author: row.author,
                cover: row.cover,
            },
        }));

        res.status(200).json({
            borrowedBooks,
            returnedBooks
        });

    } catch (err) {
        console.error("Error fetching borrowed books:", err);
        res.status(500).json({ error: "Database error" });
    }
};



// ✅ Handle Unavailable Book Request
export const requestBook = async (req, res) => {
    const { bookId, userId } = req.body;

    if (!bookId || !userId) {
        return res.status(400).json({ message: "Book ID and User ID are required." });
    }

    try {
        // Check if there's already an active request/borrow for this book by the same user
        const checkQuery = `
      SELECT * FROM transactions 
      WHERE book_id = ? AND borrower_id = ? 
        AND status IN ('Requested', 'Approved')
    `;
        const [existing] = await pool.query(checkQuery, [bookId, userId]);

        if (existing.length > 0) {
            return res.status(400).json({ message: "You already have an active request or borrowing for this book." });
        }

        // Insert new transaction request
        const insertQuery = `
      INSERT INTO transactions (book_id, borrower_id, status, request_date) 
      VALUES (?, ?, 'Requested', NOW())
    `;
        await pool.query(insertQuery, [bookId, userId]);

        res.json({ message: "Book request submitted successfully." });
    } catch (err) {
        console.error("Error in requesting book:", err);
        res.status(500).json({ message: "Database error while requesting book." });
    }
};


export const returnBook = async (req, res) => {
    const { transactionId } = req.params;
    //   console.log("Returning transactionId:", transactionId);

    try {
        // First, check if transaction exists and is approved
        const [transaction] = await pool.query(
            'SELECT * FROM transactions WHERE id = ? AND status = "Approved"',
            [transactionId]
        );

        if (transaction.length === 0) {
            return res.status(404).json({ message: "Transaction not found or not approved." });
        }

        // Update transaction status to 'Returned'
        await pool.query(
            'UPDATE transactions SET status = "Returned", return_date = NOW() WHERE id = ?',
            [transactionId]
        );

        res.json({ message: "Book returned successfully!" });
    } catch (err) {
        console.error("Error returning book:", err);
        res.status(500).json({ message: "Database error while returning book." });
    }
};


export const getSuccessfulTransactions = async (req, res) => {
    const { clubId } = req.params;
    const connection = await pool.getConnection();
  
    try {
      // Count transactions where the book was successfully borrowed and returned
      const [result] = await connection.query(
        `SELECT COUNT(*) AS totalSuccessfulTransactions
         FROM transactions t
         JOIN books b ON t.book_id = b.id
         WHERE t.status = 'Returned' AND b.clubId = ?`,
        [clubId]
      );
  
      res.status(200).json({ totalSuccessfulTransactions: result[0].totalSuccessfulTransactions });
    } catch (error) {
      console.error("Error fetching successful transactions:", error);
      res.status(500).json({ error: "Database error" });
    } finally {
      connection.release();
    }
  };