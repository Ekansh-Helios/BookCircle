import React, { useEffect, useState } from "react";
import axios from "axios";

const BookList = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [requestMessage, setRequestMessage] = useState({});

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/books");  // Fixed API URL
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error.response?.data || error.message);
    }
  };

  const handleBorrow = (bookId) => {
    console.log(`Borrowing book with ID: ${bookId}`);
  };

  const handleRequest = (bookId) => {
    console.log(`Requesting book with ID: ${bookId}, Message: ${requestMessage[bookId]}`);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${bookId}`);
        setBooks(books.filter(book => book.id !== bookId));
        console.log(`Deleted book with ID: ${bookId}`);
      } catch (error) {
        console.error("Error deleting book:", error.response?.data || error.message);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book Listings</h2>
      <div className="row">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <img src={book.cover} alt={book.title} className="card-img-top" />
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text">Author: {book.author}</p>
                  <p className="card-text">Status: {book.available ? "Available" : "Unavailable"}</p>

                  {book.available ? (
                    <button className="btn btn-primary" onClick={() => handleBorrow(book.id)}>Borrow</button>
                  ) : (
                    <div>
                      <button className="btn btn-warning" onClick={() => handleRequest(book.id)}>Request</button>
                      <input
                        type="text"
                        placeholder="Optional message"
                        className="form-control mt-2"
                        onChange={(e) => setRequestMessage({ ...requestMessage, [book.id]: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="mt-3">
                    <h6>Reviews & Ratings</h6>
                    {book.reviews?.length > 0 ? (
                      book.reviews.map((review) => (
                        <p key={review.id}><strong>{review.user}:</strong> {review.text} ⭐{review.rating}</p>
                      ))
                    ) : (
                      <p>No reviews yet.</p>
                    )}
                  </div>

                  {user?.role === "clubAdmin" && (
                    <button className="btn btn-danger mt-3" onClick={() => handleDelete(book.id)}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No books available.</p>
        )}
      </div>
    </div>
  );
};

export default BookList;