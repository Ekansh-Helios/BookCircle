import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Modal, Button, Form } from "react-bootstrap";

const BorrowedBooksList = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("borrowed");
  const [error, setError] = useState("");
  const [requestsReceived, setRequestsReceived] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);

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

  const handleReturn = (transactionId) => {
    setCurrentTransactionId(transactionId);
    setShowConfirmationModal(true);
  };

  const handleDirectReturn = async () => {
    try {
      // Proceed with returning the book
      const response = await axios.put(
        `http://localhost:5000/api/transactions/return/${currentTransactionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message || "Book returned successfully!");
      fetchBorrowedBooks();
      setShowConfirmationModal(false);
      setCurrentTransactionId(null);
    } catch (error) {
      console.error("Error returning book:", error.response?.data || error.message);
      alert("Failed to return the book.");
    }
  };

  const handleReviewSubmit = async () => {
    try {
      // Submit review and rating
      await axios.post(
        `http://localhost:5000/api/reviews/add`,
        {
          transactionId: currentTransactionId,
          review,
          rating,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Proceed with returning the book
      const response = await axios.put(
        `http://localhost:5000/api/transactions/return/${currentTransactionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message || "Book returned successfully!");
      fetchBorrowedBooks();
      setShowReviewModal(false);
      setReview("");
      setRating(0);
      setCurrentTransactionId(null);
    } catch (error) {
      console.error("Error submitting review or returning book:", error.response?.data || error.message);
      alert("Failed to submit review or return the book.");
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

      {/* Confirmation Modal */}
      <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Have you read the book?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowConfirmationModal(false);
            handleDirectReturn();
          }}>
            No
          </Button>
          <Button variant="primary" onClick={() => {
            setShowConfirmationModal(false);
            setShowReviewModal(true);
          }}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review and Rating Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Review and Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="review">
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="rating" className="mt-3">
              <Form.Label>Rating</Form.Label>
              <Form.Control
                as="select"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value={0}>Select Rating</option>
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Fair</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Very Good</option>
                <option value={5}>5 - Excellent</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReviewSubmit}>
            Submit Review and Return
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BorrowedBooksList;