import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const BookAddition = () => {
  const navigate = useNavigate();

  // Get clubId from Redux store
  const clubId = useSelector((state) => state.auth.userData.clubId);

  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
    book_condition: "New",
    cover: null,
  });

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBookData({ ...bookData, cover: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", bookData.title);
    formData.append("author", bookData.author);
    formData.append("genre", bookData.genre);
    formData.append("description", bookData.description);
    formData.append("book_condition", bookData.book_condition);
    formData.append("cover", bookData.cover);
    formData.append("clubId", clubId); // Add clubId

    // 🔑 Get token from sessionStorage
    const token = sessionStorage.getItem("authToken");

    try {
      const response = await axios.post("http://localhost:5000/api/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Pass token here
        },
      });

      console.log("Book added:", response.data);
      navigate("/my-books"); // Redirect after submission
    } catch (error) {
      console.error("Error adding book:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error adding book");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Add a New Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Book Title *</label>
          <input type="text" name="title" value={bookData.title} onChange={handleChange} required className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Author *</label>
          <input type="text" name="author" value={bookData.author} onChange={handleChange} required className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Genre *</label>
          <select name="genre" value={bookData.genre} onChange={handleChange} required className="form-select">
            <option value="">Select Genre</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Mystery">Mystery</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Book Description *</label>
          <textarea name="description" value={bookData.description} onChange={handleChange} required className="form-control" rows="3"></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Book Condition *</label>
          <select name="book_condition" value={bookData.book_condition} onChange={handleChange} required className="form-select">
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Worn">Worn</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Book Cover *</label>
          <input type="file" onChange={handleFileChange} className="form-control" required />
        </div>
        <button type="submit" className="btn btn-primary">Add Book</button>
      </form>
    </div>
  );
};

export default BookAddition;
