import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.auth.userData);
  const token = sessionStorage.getItem("authToken");

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${notificationId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh notifications list
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Your Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications yet!</p>
      ) : (
        <ul className="list-group">
          {notifications.map((notif) => (
            <li key={notif.id} className={`list-group-item d-flex justify-content-between align-items-center ${notif.is_read ? '' : 'list-group-item-info'}`}>
              <div>
                <strong>{notif.message}</strong> <br />
                <small>{new Date(notif.created_at).toLocaleString()}</small>
              </div>
              {!notif.is_read && (
                <button className="btn btn-sm btn-primary" onClick={() => markAsRead(notif.id)}>
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
