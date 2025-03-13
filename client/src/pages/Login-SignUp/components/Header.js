
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../../App.css';

const Header = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 200);
  }, [location]);

  const getData = async () => {
    const data = await JSON.parse(sessionStorage.getItem('userData'));
    if (data && data.isLoggedIn) {
      setUserData(data.userData);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setUserData(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to={userData ? '/books-list' : '/'} style={{ textDecoration: 'none' }}>
          <i className="fas fa-book logo-icon"></i>
          <span className="logo-text">BookCircle</span>
        </Link>
      </div>

      <ul className="navbar-links">
        {userData ? (
          <>
            {/* Common for All Users */}
            <li>
              <Link to="/books-list" className={location.pathname === '/books-list' ? 'active' : ''}>Home</Link>
            </li>
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
                <li>
                  <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
                </li>

            {/* Super Admin & Club Admin Only */}
            {(userData.role === 'superAdmin' || userData.role === 'clubAdmin') && (
              <>
                {userData.role === 'superAdmin' && (
                  <>
                    <li>
                      <Link to="/manage-clubs" className={location.pathname === '/manage-clubs' ? 'active' : ''}>Manage Clubs</Link>
                    </li>
                    <li>
                      <Link to="/manage-users" className={location.pathname === '/manage-users' ? 'active' : ''}>Manage Users</Link>
                    </li>
                  </>
                )}
                <li>
                  <Link to="/manage-books" className={location.pathname === '/manage-books' ? 'active' : ''}>Manage Books</Link>
                </li>
                <li>
                  <Link to="/review-approvals" className={location.pathname === '/review-approvals' ? 'active' : ''}>Review Approvals</Link>
                </li>
              </>
            )}

            {/* Notifications and Logout */}
            <li>
              <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                <i className="fas fa-bell"></i> Notifications
              </Link>
            </li>
            <li>
              <i className="fas fa-sign-out-alt logo-icon" style={{ cursor: 'pointer' }} onClick={logout}></i>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
            </li>
            {/* <li>
              <Link to="/signup" className={location.pathname === '/signup' ? 'active' : ''}>Sign Up</Link>
            </li> */}
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
