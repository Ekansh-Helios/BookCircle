import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const user = useSelector((state) => state.auth.userData);
  const token = sessionStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error.response?.data || error.message);
    }
  };

  const handleBorrow = async (e, bookId, ownerId) => {
    e.stopPropagation(); // Prevent triggering row click
    try {
      const response = await axios.post(
        "http://localhost:5000/api/transactions/borrow",
        { bookId, ownerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "Borrow request sent!");
    } catch (error) {
      console.error("Error borrowing book:", error.response?.data || error.message);
      alert(error.response?.data.message || "Failed to borrow book");
    }
  };

  const handleRequest = async (e, bookId) => {
    e.stopPropagation(); // Prevent triggering row click
    if (!user || !user.id) {
      alert("User not logged in!");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/transactions/request",
        { bookId: bookId, userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "Request sent!");
    } catch (error) {
      console.error("Error requesting book:", error.response?.data || error.message);
      alert(error.response?.data.message || "Failed to request book");
    }
  };

  const handleDelete = async (e, bookId) => {
    e.stopPropagation(); // Prevent triggering row click
    if (!user || user.userType !== "clubAdmin") {
      alert("Unauthorized");
      return;
    }
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(books.filter(book => book.id !== bookId));
      } catch (error) {
        console.error("Error deleting book:", error.response?.data || error.message);
      }
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return "No ratings";
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return `${(total / reviews.length).toFixed(1)} / 5`;
  };

  const handleBookClick = (bookId) => {
    navigate(`/book-details/${bookId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book Listings</h2>

      <div className="row fw-bold border-bottom pb-2 mb-3">
        <div className="col-md-1">Cover</div>
        <div className="col-md-2">Title</div>
        <div className="col-md-2">Author</div>
        <div className="col-md-2">Genre</div>
        <div className="col-md-1">Status</div>
        <div className="col-md-2">Actions</div>
        <div className="col-md-2">Ratings</div>
      </div>

      {books.length > 0 ? (
        books.map((book) => (
          <div 
            key={book.id} 
            className="row align-items-center mb-3 border-bottom pb-2"
            style={{ cursor: "pointer", backgroundColor: "#f9f9f9" }}
            onClick={() => handleBookClick(book.id)}
          >
            {/* Cover */}
            <div className="col-md-1">
              <img
                src={book.cover ? book.cover : "/default-cover.jpg"}
                alt={book.title}
                style={{ width: "90px", height: "120px", objectFit: "cover" }}
                onError={(e) => { e.target.src = "/default-cover.jpg"; }}
              />
            </div>

            {/* Title */}
            <div className="col-md-2">
              <strong>{book.title}</strong>
            </div>

            {/* Author */}
            <div className="col-md-2">{book.author}</div>

            {/* Genre */}
            <div className="col-md-2">{book.genre}</div>

            {/* Status */}
            <div className="col-md-1">
              <span
                className={`badge ${book.status === "Available" ? "bg-success" : "bg-secondary"}`}
              >
                {book.status}
              </span>
            </div>

            {/* Actions */}
            <div className="col-md-2">
              {book.status === "Available" ? (
                <button 
                  className="btn btn-sm btn-primary mb-1"
                  onClick={(e) => handleBorrow(e, book.id, book.owner_id)}
                >
                  Borrow
                </button>
              ) : (
                <button 
                  className="btn btn-sm btn-warning mb-1"
                  onClick={(e) => handleRequest(e, book.id)}
                >
                  Request
                </button>
              )}

              {(user?.userType === "clubAdmin" || user.userType === "superAdmin") && (
                <button 
                  className="btn btn-sm btn-danger ms-3 mb-1"
                  onClick={(e) => handleDelete(e, book.id)}
                >
                  Delete
                </button>
              )}
            </div>

            {/* Ratings */}
            <div className="col-md-2">
              <small>{calculateAverageRating(book.reviews)}</small>
            </div>
          </div>
        ))
      ) : (
        <p>No books available.</p>
      )}
    </div>
  );
};

export default BookList;
