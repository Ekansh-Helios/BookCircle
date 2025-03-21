// utils/notificationHelper.js

import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createNotification = async (userId, message) => {
  const notificationId = uuidv4();
  const q = `INSERT INTO notifications (notification_id, user_id, message, created_at) VALUES (?, ?, ?, NOW())`;
  try {
    await pool.query(q, [notificationId, userId, message]);
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};
