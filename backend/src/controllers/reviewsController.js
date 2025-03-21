import {pool} from "../config/db.js";

export const addReview = async (req, res) => {
    try {
        const { book_id, rating, comment } = req.body;
        const user_id = req.user.id;

        if (!rating || !book_id) {
            return res.status(400).json({ error: "Rating and book ID are required." });
        }

        const q = `
        INSERT INTO reviews (book_id, user_id, rating, comment, isApproved)
        VALUES (?, ?, ?, ?, ?)
      `;
        const values = [book_id, user_id, rating, comment || '', true]; // Assuming auto-approved for now

        await pool.query(q, values);

        res.status(201).json({ message: "Review added successfully." });
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ error: "Database error" });
    }
};

export const getBookReviews = async (req, res) => {
    try {
        const bookId = req.params.bookId;

        const q = `
        SELECT reviews.reviewId, reviews.rating, reviews.comment, reviews.date, reviews.edited_at,
               users.name AS reviewer
        FROM reviews
        JOIN users ON reviews.user_id = users.id
        WHERE reviews.book_id = ? AND reviews.isApproved = true
        ORDER BY reviews.date DESC
      `;

        const [reviews] = await pool.query(q, [bookId]);

        res.status(200).json(reviews);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ error: "Database error" });
    }
};


export const editReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const q = `
        UPDATE reviews
        SET rating = ?, comment = ?, edited_at = NOW()
        WHERE reviewId = ? AND user_id = ?
      `;

        const [result] = await pool.query(q, [rating, comment, reviewId, userId]);

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: "You are not authorized to edit this review." });
        }

        res.status(200).json({ message: "Review updated successfully." });
    } catch (err) {
        console.error("Error editing review:", err);
        res.status(500).json({ error: "Database error" });
    }
};


export const approveReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const { isApproved } = req.body; // true or false

        const q = `
        UPDATE reviews
        SET isApproved = ?
        WHERE reviewId = ?
      `;

        await pool.query(q, [isApproved, reviewId]);

        res.status(200).json({ message: "Review approval updated." });
    } catch (err) {
        console.error("Error approving review:", err);
        res.status(500).json({ error: "Database error" });
    }
};
