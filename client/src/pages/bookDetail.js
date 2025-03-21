// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const BookDetailPage = () => {
//   const { bookId } = useParams();
//   const [book, setBook] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const user = useSelector((state) => state.auth.userData);
//   const token = sessionStorage.getItem('authToken');

//   useEffect(() => {
//     const fetchBookDetails = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/books/${bookId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setBook(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load book details');
//         setLoading(false);
//       }
//     };

//     fetchBookDetails();
//   }, [bookId, token]);

//   const handleBorrow = async (e, bookId, ownerId) => {
//     e.stopPropagation(); // Prevent triggering row click
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/transactions/borrow",
//         { bookId, ownerId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert(response.data.message || "Borrow request sent!");
//     } catch (error) {
//       console.error("Error borrowing book:", error.response?.data || error.message);
//       alert(error.response?.data.message || "Failed to borrow book");
//     }
//   };

//   const handleRequest = async (e, bookId) => {
//     e.stopPropagation(); // Prevent triggering row click
//     if (!user || !user.id) {
//       alert("User not logged in!");
//       return;
//     }
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/transactions/request",
//         { bookId: bookId, userId: user.id },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert(response.data.message || "Request sent!");
//     } catch (error) {
//       console.error("Error requesting book:", error.response?.data || error.message);
//       alert(error.response?.data.message || "Failed to request book");
//     }
//   };

//   if (loading) return <div style={styles.loading}>Loading...</div>;
//   if (error) return <div style={styles.error}>{error}</div>;

//   return (
//     <div style={styles.container}>
//       <h1 style={styles.title}>{book.title}</h1>
//       <img src={book.cover} alt={book.title} style={styles.cover} />
//       <p><strong>Author:</strong> {book.author}</p>
//       <p><strong>Genre:</strong> {book.genre}</p>
//       <p><strong>Description:</strong> {book.description}</p>
//       <p><strong>Condition:</strong> {book.book_condition}</p>
//       <p><strong>Club:</strong> {book.clubName}</p>
//       <p><strong>Status:</strong> {book.availability === "Available" ? 'Available' : 'Not Available'}</p>

//       <div style={styles.actions}>
//         {book.availability === "Available" ? (
//           <button 
//             style={styles.button} 
//             onClick={(e) => handleBorrow(e, bookId, book.owner_id)}
//           >
//             Borrow
//           </button>
//         ) : (
//           <button 
//             style={styles.requestToBorrow} 
//             onClick={(e) => handleRequest(e, book.id)}
//           >
//             Request to Borrow
//           </button>
//         )}
//       </div>

//       <div style={styles.reviewsSection}>
//         <h2>Average Rating: {book.averageRating || 'N/A'}</h2>
//         <h3>Reviews:</h3>
//         {book.reviews && book.reviews.length > 0 ? (
//           book.reviews.map((review) => (
//             <div key={review.reviewId} style={styles.review}>
//               <p><strong>Rating:</strong> {review.rating}/5</p>
//               <p>{review.comment}</p>
//               <p><em>{new Date(review.date).toLocaleDateString()}</em></p>
//             </div>
//           ))
//         ) : (
//           <p>No reviews yet.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     padding: '20px',
//     maxWidth: '800px',
//     margin: '0 auto',
//   },
//   title: {
//     fontSize: '2rem',
//     marginBottom: '10px',
//   },
//   cover: {
//     width: '200px',
//     height: '300px',
//     objectFit: 'cover',
//     marginBottom: '20px',
//   },
//   actions: {
//     marginTop: '20px',
//   },
//   button: {
//     padding: '10px 20px',
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     borderRadius: '5px',
//     cursor: 'pointer',
//   },
//   requestToBorrow: {
//     padding: '10px 20px',
//     backgroundColor: '#ffc107',
//     color: 'black',
//     border: 'none',
//     borderRadius: '5px',
//     cursor: 'pointer',
//   },
//   reviewsSection: {
//     marginTop: '30px',
//   },
//   review: {
//     borderBottom: '1px solid #ccc',
//     paddingBottom: '10px',
//     marginBottom: '10px',
//   },
//   loading: {
//     textAlign: 'center',
//     marginTop: '50px',
//   },
//   error: {
//     textAlign: 'center',
//     color: 'red',
//     marginTop: '50px',
//   },
// };

// export default BookDetailPage;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.userData);
  const token = sessionStorage.getItem('authToken');

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBook(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load book details');
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId, token]);

  const handleBorrow = async (e, bookId, ownerId) => {
    e.stopPropagation();
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
    e.stopPropagation();
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

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <div style={styles.topSection}>
          <img src={book.cover} alt={book.title} style={styles.cover} />
          <div style={styles.details}>
            <h1 style={styles.title}>{book.title}</h1>
            <p style={styles.author}>by {book.author}</p>
            <p><strong>Genre:</strong> {book.genre}</p>
            <p><strong>Description:</strong> {book.description}</p>
            <p><strong>Condition:</strong> {book.book_condition}</p>
            <p><strong>Club:</strong> {book.clubName}</p>
            <p><strong>Status:</strong> {book.availability === "Available" ? 'Available' : 'Not Available'}</p>

            <div style={styles.actions}>
              {book.availability === "Available" ? (
                <button 
                  style={styles.borrowButton} 
                  onClick={(e) => handleBorrow(e, bookId, book.owner_id)}
                >
                  Borrow
                </button>
              ) : (
                <button 
                  style={styles.requestButton} 
                  onClick={(e) => handleRequest(e, book.id)}
                >
                  Request to Borrow
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.reviewsCard}>
        <h2 style={styles.sectionTitle}>Average Rating: {book.averageRating || 'N/A'}</h2>
        <h3 style={styles.sectionSubTitle}>Reviews</h3>
        <div style={styles.reviewsList}>
          {book.reviews && book.reviews.length > 0 ? (
            book.reviews.map((review) => (
              <div key={review.reviewId} style={styles.review}>
                <div style={styles.reviewHeader}>
                  <span style={styles.rating}>{review.rating}/5 ⭐</span>
                  <span style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <p style={styles.comment}>{review.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    padding: '40px',
    // maxWidth: '1000px',
    margin: '0 auto',
    // backgroundColor: '#f8f9fa',
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  topSection: {
    display: 'flex',
    gap: '20px',
  },
  cover: {
    width: '220px',
    height: '330px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: '2rem',
    marginBottom: '5px',
  },
  author: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    color: '#555',
  },
  actions: {
    marginTop: '20px',
  },
  borrowButton: {
    padding: '10px 25px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: '0.3s',
  },
  requestButton: {
    padding: '10px 25px',
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.3s',
  },
  reviewsCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    marginBottom: '10px',
    fontSize: '1.5rem',
  },
  sectionSubTitle: {
    marginBottom: '15px',
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  review: {
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  rating: {
    fontWeight: 'bold',
    color: '#f39c12',
  },
  reviewDate: {
    color: '#777',
    fontSize: '0.9rem',
  },
  comment: {
    fontStyle: 'italic',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
  },
  error: {
    textAlign: 'center',
    color: 'red',
    marginTop: '50px',
  },
};

export default BookDetailPage;
