import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const BorrowedBooksList = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("borrowed");
  const [error, setError] = useState("");
  const [requestsReceived, setRequestsReceived] = useState([]);


  const user = useSelector((state) => state.auth.userData);
  const token = sessionStorage.getItem("authToken");

  useEffect(() => {
    if (user) {
      fetchBorrowedBooks();
      fetchRequestedBooks();
      fetchRequestsReceived();
    }
  }, [user]);


  const fetchRequestsReceived = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/transactions/received/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestsReceived(response.data);
    } catch (error) {
      console.error("Error fetching requests received:", error.response?.data || error.message);
      setError("Failed to load received requests.");
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/transactions/borrowed/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBorrowedBooks(response.data);
    } catch (error) {
      console.error("Error fetching borrowed books:", error.response?.data || error.message);
      setError("Failed to load borrowed books.");
    }
  };

  const fetchRequestedBooks = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/transactions/requested/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestedBooks(response.data);
    } catch (error) {
      console.error("Error fetching requested books:", error.response?.data || error.message);
      setError("Failed to load requested books.");
    }
  };

  const handleReturn = async (transactionId) => {
    if (window.confirm("Are you sure you want to return this book?")) {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/transactions/return/${transactionId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(response.data.message || "Book returned successfully!");
        fetchBorrowedBooks();
      } catch (error) {
        console.error("Error returning book:", error.response?.data || error.message);
        alert("Failed to return the book.");
      }
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/transactions/approve/${transactionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "Request approved!");
      fetchRequestsReceived();
    } catch (error) {
      console.error("Error approving request:", error.response?.data || error.message);
      alert("Failed to approve the request.");
    }
  };

  const handleReject = async (transactionId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/transactions/reject/${transactionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "Request rejected!");
      fetchRequestsReceived();
    } catch (error) {
      console.error("Error rejecting request:", error.response?.data || error.message);
      alert("Failed to reject the request.");
    }
  };


  const renderStatusBadge = (status) => {
    let badgeClass = "bg-secondary";
    switch (status) {
      case "Requested":
        badgeClass = "bg-warning text-dark";
        break;
      case "Approved":
        badgeClass = "bg-success";
        break;
      case "Returned":
        badgeClass = "bg-secondary";
        break;
      case "Rejected":
      case "Canceled":
        badgeClass = "bg-danger";
        break;
      default:
        badgeClass = "bg-light text-dark";
    }
    return <span className={`badge ${badgeClass}`}>{status}</span>;
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Books</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
  <li className="nav-item">
    <button
      className={`nav-link d-flex align-items-center justify-content-between ${activeTab === "borrowed" ? "active" : ""}`}
      onClick={() => setActiveTab("borrowed")}
    >
      <span>Borrowed Books</span>
      <span className="badge bg-primary ms-2">{borrowedBooks.length}</span>
    </button>
  </li>
  <li className="nav-item">
    <button
      className={`nav-link d-flex align-items-center justify-content-between ${activeTab === "requested" ? "active" : ""}`}
      onClick={() => setActiveTab("requested")}
    >
      <span>Requested Books</span>
      <span className="badge bg-primary ms-2">{requestedBooks.length}</span>
    </button>
  </li>
  <li className="nav-item">
    <button
      className={`nav-link d-flex align-items-center justify-content-between ${activeTab === "received" ? "active" : ""}`}
      onClick={() => setActiveTab("received")}
    >
      <span>Requests Received</span>
      <span className="badge bg-primary ms-2">{requestsReceived.length}</span>
    </button>
  </li>
</ul>


      {/* Borrowed Books */}
      {activeTab === "borrowed" && (
        <>
          {borrowedBooks.length > 0 ? (
            borrowedBooks.map((transaction) => (
              <div key={transaction.id} className="row align-items-center mb-3 border-bottom pb-2">
                <div className="col-md-1">
                  <img
                    src={transaction.book.cover || "/default-cover.jpg"}
                    alt={transaction.book.title}
                    style={{ width: "50px", height: "70px", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "/default-cover.jpg"; }}
                  />
                </div>
                <div className="col-md-4">
                  <strong>{transaction.book.title}</strong>
                  <div><small>Author: {transaction.book.author}</small></div>
                </div>
                <div className="col-md-2">
                  {renderStatusBadge(transaction.status)}
                </div>
                <div className="col-md-3">
                  <div><strong>Borrowed On:</strong> {new Date(transaction.request_date).toLocaleDateString()}</div>
                  <div><strong>Due Date:</strong> {new Date(transaction.due_date).toLocaleDateString()}</div>
                  {/* <div><strong>Due:</strong> {transaction.due_date ? transaction.due_date.split("T")[0] : "N/A"}</div> */}
                </div>
                <div className="col-md-2">
                  {transaction.status === "Approved" && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleReturn(transaction.transaction_id)}
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No borrowed books found.</p>
          )}
        </>
      )}

      {/* Requested Books */}
      {activeTab === "requested" && (
        <>
          {requestedBooks.length > 0 ? (
            requestedBooks.map((transaction) => (
              <div key={transaction.id} className="row align-items-center mb-3 border-bottom pb-2">
                <div className="col-md-1">
                  <img
                    src={transaction.book.cover || "/default-cover.jpg"}
                    alt={transaction.book.title}
                    style={{ width: "50px", height: "70px", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "/default-cover.jpg"; }}
                  />
                </div>
                <div className="col-md-4">
                  <strong>{transaction.book.title}</strong>
                  <div><small>Author: {transaction.book.author}</small></div>
                </div>
                <div className="col-md-3">
                  Requested On: {new Date(transaction.request_date).toLocaleDateString()}
                </div>
                <div className="col-md-2">
                  {renderStatusBadge(transaction.status)}
                </div>
              </div>
            ))
          ) : (
            <p>No requested books found.</p>
          )}
        </>
      )}

      {activeTab === "received" && (
        <>
          {requestsReceived.length > 0 ? (
            requestsReceived.map((transaction) => (
              <div key={transaction.id} className="row align-items-center mb-3 border-bottom pb-2">
                <div className="col-md-1">
                  <img
                    src={transaction.book.cover || "/default-cover.jpg"}
                    alt={transaction.book.title}
                    style={{ width: "50px", height: "70px", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "/default-cover.jpg"; }}
                  />
                </div>
                <div className="col-md-4">
                  <strong>{transaction.book.title}</strong>
                  <div><small>Author: {transaction.book.author}</small></div>
                </div>
                <div className="col-md-3">
                  Requested On: {new Date(transaction.request_date).toLocaleDateString()}
                </div>
                <div className="col-md-2">
                  {renderStatusBadge(transaction.status)}
                </div>
                {transaction.status === "Requested" && (
                  <div className="col-md-2 d-flex gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleApprove(transaction.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleReject(transaction.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No incoming requests.</p>
          )}
        </>
      )}

    </div>
  );
};

export default BorrowedBooksList;
