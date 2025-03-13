// Import necessary modules and configurations
import { pool } from "../config/db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load the JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Function to register a new user
export const registerUser = async (user) => {
    try {
        // Check if the user already exists in the database
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [user.email]);
        if (existingUser.length > 0) {
            return { success: false, message: 'User already exists' };
        }
        
        // Hash the user's password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const query = `INSERT INTO users (name, email, mobile, password, userType) VALUES (?, ?, ?, ?,?)`;
        const values = [user.username, user.email, user.mobile, hashedPassword, user.userType];
        
        // Insert the new user into the database
        await pool.query(query, values);
        return { success: true, message: 'User registered successfully' };
    } catch (error) {
        console.log(error);
        console.error("Registration error:", error);
        return { success: false, message: 'Registration failed. Please try again later.' };
    }
};

// Function to log in a user and generate a JWT token
export const loginUser = async (email, password) => {
    try {
        // Retrieve the user from the database
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return { success: false, message: 'User not found' };
        }
        
        const user = rows[0];
        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return { success: false, message: 'Incorrect password' };
        }
        
        // Generate a JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, userType: user.userType },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("Generated token:", token); // For debugging
        
        return { 
            success: true, 
            message: 'Login successful', 
            token, 
            user: { id: user.id, email: user.email, userType: user.userType } 
        };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: 'Login failed. Please try again later.' };
    }
};

// Function to get user details from a JWT token
export const getUserFromToken = async (token) => {
    try {
        const trimmedToken = token.trim();
        console.log("Received token:", trimmedToken);

        // Verify the token
        const decoded = jwt.verify(trimmedToken, JWT_SECRET);
        console.log("Decoded token:", decoded);

        // Retrieve user details from the database
        const [rows] = await pool.query('SELECT id, name, email, mobile, userType, clubId, isActive FROM users WHERE id = ?', [decoded.id]);

        if (rows.length === 0) {
            return { success: false, message: 'User not found' };
        }

        const user = rows[0];
        return { success: true, user };
    } catch (error) {
        console.error("Token verification error:", error);
        return { success: false, message: 'Invalid or expired token' };
    }
};
