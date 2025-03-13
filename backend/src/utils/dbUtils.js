// Import the database connection pool from the configuration file
import { pool } from "../config/db.js";

// SQL query to create the 'users' table if it does not already exist
const userTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  mobile VARCHAR(15), -- Mobile field added
  password VARCHAR(255) NOT NULL, -- Storing hashed passwords
  userType ENUM('user', 'superAdmin', 'clubAdmin') DEFAULT 'user',
  clubId INT DEFAULT NULL, -- New field to store the assigned club
  MFA TINYINT(1) DEFAULT 0, -- Multi-Factor Authentication (0 = disabled, 1 = enabled)
  isActive TINYINT(1) DEFAULT 1, -- User active status (1 = active, 0 = inactive)
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clubId) REFERENCES clubs(id) ON DELETE SET NULL -- Ensures referential integrity
);`;


// Function to create a table based on the provided query
const createTable = async (tableName, query) => {
  try {
    await pool.query(query); // Execute the query using the connection pool
    console.log(`${tableName} table created or already exists`); // Log success message
  } catch (error) {
    console.log(`Error creating ${tableName}`, error); // Log error message if query fails
  }
};

// Function to create all necessary tables
const createAllTable = async () => {
  try {
    await createTable("Users", userTableQuery); // Create 'users' table
    console.log("All tables created successfully!!"); // Log success message
  } catch (error) {
    console.log("Error creating tables", error); // Log error message if any table creation fails
    throw error; // Rethrow the error to be handled by the caller
  }
};

// Export the createAllTable function
export default createAllTable;
