import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyBooksPage = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/books/my-books");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Books</h2>
        <button className="btn btn-primary" onClick={() => navigate("/add-book")}>
          + Add Book
        </button>
      </div>

      <div className="row">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="col-md-4 mb-4">
              <div className="card">
                <img src={`http://localhost:5000${book.cover}`} className="card-img-top" alt={book.title} />
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text"><strong>Author:</strong> {book.author}</p>
                  <p className="card-text"><strong>Genre:</strong> {book.genre}</p>
                  <p className="card-text"><strong>Condition:</strong> {book.book_condition}</p>
                  <p className="card-text"><strong>Description:</strong> {book.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No books added yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyBooksPage;
