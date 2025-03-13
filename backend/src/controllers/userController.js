
import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

// Controller function to get all users
export const getUsers = async (req, res) => {
  const q = "SELECT * FROM users";
  try {
    const [data] = await pool.query(q);
    res.json(data);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Controller function to add a new user
export const addUser = async (req, res) => {
  console.log("req.body:", req.body); 
  const { name, email, mobile, password, userType, clubId, MFA = false, isActive = true } = req.body;

  // Validate required fields
  if (!name || !email || !mobile || !password || !userType || !clubId) {
    return res.status(400).json({ success: false, message: "All fields (including club) are required" });
  }

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const q = `
      INSERT INTO users (name, email, mobile, password, userType, clubId, MFA, isActive, CreatedAt, UpdatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      name, 
      email, 
      mobile, 
      hashedPassword, 
      userType, 
      clubId || null,  // Ensure clubId is included, or null if not provided
      MFA || false, 
      isActive !== undefined ? isActive : true
    ];

    const [result] = await pool.query(q, values);
    res.status(201).json({ success: true, message: "User added successfully", userId: result.insertId });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};


// Controller function to toggle user status (activate/deactivate)
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  try {
    // Get the current status of the user
    const [user] = await pool.query("SELECT isActive FROM users WHERE id = ?", [id]);

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Toggle the isActive status
    const newStatus = !user[0].isActive;

    // Update the status in the database
    const q = "UPDATE users SET isActive = ?, UpdatedAt = NOW() WHERE id = ?";
    await pool.query(q, [newStatus, id]);

    return res.json({ 
      success: true, 
      message: `User ${newStatus ? "activated" : "deactivated"} successfully`,
      isActive: newStatus
    });

  } catch (err) {
    console.error("Error toggling user status:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
