import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import '../../../App.css';

const Header = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const clubName = useSelector((state) => state.auth.clubName);

  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 200);
  }, [location]);

  useEffect(() => {
    if (userData) {
      fetchUnreadNotifications();
    }
  }, [userData]);

  const getData = async () => {
    const data = await JSON.parse(sessionStorage.getItem('userData'));
    if (data && data.isLoggedIn) {
      setUserData(data.userData);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(`http://localhost:5000/api/notifications/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const unread = response.data.filter(notif => !notif.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setUserData(null);
    setUnreadCount(0);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to={userData ? '/books-list' : '/'} style={{ textDecoration: 'none', paddingLeft: '20px' }}>
          <i className="fas fa-book logo-icon"></i>
          <span className="logo-text">BookCircle - {clubName} Reading Club</span>
        </Link>
      </div>

      <ul className="navbar-links">
        {userData ? (
          <>
            {/* Super Admin & Club Admin Only */}
            {(userData.userType === 'superAdmin' || userData.userType === 'clubAdmin') && (
              <li>
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
              </li>
            )}

            {/* Common for All Users */}
            <li>
              <Link to="/books-list" className={location.pathname === '/books-list' ? 'active' : ''}>Books List</Link>
            </li>
            <li>
              <Link to="/my-books" className={location.pathname === '/my-books' ? 'active' : ''}>My Books</Link>
            </li>
            <li>
              <Link to="/borrowed-books" className={location.pathname === '/borrowed-books' ? 'active' : ''}>Borrowed Books</Link>
            </li>
            <li>
              <Link to="/my-reviews" className={location.pathname === '/my-reviews' ? 'active' : ''}>My Reviews</Link>
            </li>

            {/* Notifications */}
            <li className="position-relative">
              <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>

            <li>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}><i className="fas fa-user"></i></Link>
            </li>

            {/* Logout */}
            <li>
              <i className="fas fa-sign-out-alt logo-icon" style={{ cursor: 'pointer' }} onClick={logout}></i>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
