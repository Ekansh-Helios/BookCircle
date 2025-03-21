import {pool} from "../config/db.js";

// ✅ Get notifications for a specific user
export const getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const q = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
    const [data] = await pool.query(q, [userId]);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// ✅ Mark a notification as read
export const markAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const q = "UPDATE notifications SET is_read = 1 WHERE id = ?";
    const [result] = await pool.query(q, [notificationId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// ✅ Clear all notifications (optional feature)
// export const clearNotifications = async (req, res) => {
//   const userId = req.user.id;
//   try {
//     const q = "DELETE FROM notifications WHERE user_id = ?";
//     await pool.query(q, [userId]);
//     res.status(200).json({ message: "All notifications cleared" });
//   } catch (err) {
//     console.error("Error clearing notifications:", err);
//     res.status(500).json({ error: "Failed to clear notifications" });
//   }
// };

// // Add a notification (used internally in other controllers)
// export const addNotification = async (userId, message) => {
//     try {
//       const q = `INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES (?, ?, ?, 0, NOW())`;
//       await pool.query(q, [uuidv4(), userId, message]);
//     } catch (err) {
//       console.error("Error adding notification:", err);
//     }
//   };