import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const token = sessionStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/reviews/my-reviews', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReviews(res.data);
            } catch (err) {
                console.error("Error fetching reviews:", err);
            }
        };

        fetchReviews();
    }, []);

    const handleEditClick = (reviewId) => {
        // Navigate to Edit Review Page (you'll create this route)
        navigate(`/edit-review/${reviewId}`);
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">My Reviews</h2>

            <div className="row fw-bold border-bottom pb-2 mb-3">
                <div className="col-md-1">Cover</div>
                <div className="col-md-3">Title</div>
                <div className="col-md-2">Author</div>
                <div className="col-md-1">Rating</div>
                <div className="col-md-3">Review</div>
                <div className="col-md-1">Status</div>
                <div className="col-md-1">Action</div>
            </div>

            {reviews.length > 0 ? (
                reviews.map((review) => (
                    <div 
                        key={review.reviewId} 
                        className="row align-items-center mb-3 border-bottom pb-2"
                        style={{ backgroundColor: "#f9f9f9" }}
                    >
                        {/* Cover */}
                        <div className="col-md-1">
                            <img
                                src={review.cover ? review.cover : "/default-cover.jpg"}
                                alt={review.title}
                                style={{ width: "90px", height: "120px", objectFit: "cover" }}
                                onError={(e) => { e.target.src = "/default-cover.jpg"; }}
                            />
                        </div>

                        {/* Title */}
                        <div className="col-md-3">
                            <strong>{review.title}</strong>
                        </div>

                        {/* Author */}
                        <div className="col-md-2">{review.author}</div>

                        {/* Rating */}
                        <div className="col-md-1">{review.rating} / 5</div>

                        {/* Review */}
                        <div className="col-md-3">{review.comment}</div>

                        {/* Approval Status */}
                        <div className="col-md-1">
                            {review.isApproved ? (
                                <span className="badge bg-success">Approved</span>
                            ) : (
                                <span className="badge bg-warning text-dark">Pending</span>
                            )}
                        </div>

                        {/* Edit Button */}
                        <div className="col-md-1">
                            <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditClick(review.reviewId)}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p>You haven't submitted any reviews yet.</p>
            )}
        </div>
    );
};

export default MyReviewsPage;
