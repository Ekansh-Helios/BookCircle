import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyBooksPage = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(
          "http://localhost:5000/api/books/my-books",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBooks(response.data.books);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const handleBookClick = (bookId) => {
    navigate(`/book-details/${bookId}`);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Books</h2>
        <button className="btn btn-primary" onClick={() => navigate("/add-book")}>
          + Add Book
        </button>
      </div>

      <div className="row fw-bold border-bottom pb-2 mb-3">
        <div className="col-md-1">Cover</div>
        <div className="col-md-3">Title</div>
        <div className="col-md-2">Author</div>
        <div className="col-md-2">Genre</div>
        <div className="col-md-2">Condition</div>
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
            <div className="col-md-3">
              <strong>{book.title}</strong>
            </div>

            {/* Author */}
            <div className="col-md-2">{book.author}</div>

            {/* Genre */}
            <div className="col-md-2">{book.genre}</div>

            {/* Condition */}
            <div className="col-md-2">{book.book_condition}</div>
          </div>
        ))
      ) : (
        <p>No books added yet.</p>
      )}
    </div>
  );
};

export default MyBooksPage;