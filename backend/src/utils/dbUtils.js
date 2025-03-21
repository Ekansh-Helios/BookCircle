// // Import the database connection pool from the configuration file
// import { pool } from "../config/db.js";

// // SQL query to create the 'users' table if it does not already exist
// const userTableQuery = `CREATE TABLE IF NOT EXISTS users (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(100) NOT NULL,
//   email VARCHAR(100) NOT NULL UNIQUE,
//   mobile VARCHAR(15),
//   password VARCHAR(255) NOT NULL,
//   userType ENUM('user', 'superAdmin', 'clubAdmin') DEFAULT 'user',
//   clubId INT DEFAULT NULL,
//   MFA TINYINT(1) DEFAULT 0,
//   isActive TINYINT(1) DEFAULT 1,
//   CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//   UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   FOREIGN KEY (clubId) REFERENCES clubs(id) ON DELETE SET NULL
// );`;

// // ✅ SQL query to create the 'clubs' table
// const clubTableQuery = `CREATE TABLE IF NOT EXISTS clubs (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(100) NOT NULL,
//   location VARCHAR(255),
//   centralLocation VARCHAR(255),
//   contactEmail VARCHAR(255),
//   isActive TINYINT(1) DEFAULT 1,
//   CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//   UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );`;

// // Function to create a table based on the provided query
// const createTable = async (tableName, query) => {
//   try {
//     await pool.query(query);
//     console.log(`${tableName} table created or already exists`);
//   } catch (error) {
//     console.log(`Error creating ${tableName}`, error);
//   }
// };

// // Function to create all necessary tables
// const createAllTable = async () => {
//   try {
//     await createTable("Clubs", clubTableQuery); // ✅ Create 'clubs' table first
//     await createTable("Users", userTableQuery); // Then 'users' table
//     console.log("All tables created successfully!!");
//   } catch (error) {
//     console.log("Error creating tables", error);
//     throw error;
//   }
// };

// // Export the createAllTable function
// export default createAllTable;



// Import the database connection pool from the configuration file
import { pool } from "../config/db.js";

// ✅ SQL query to create the 'clubs' table
const clubTableQuery = `CREATE TABLE IF NOT EXISTS clubs (
  ClubID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Location VARCHAR(255),
  CentralLocation VARCHAR(255),
  ContactEmail VARCHAR(255),
  isActive TINYINT(1) DEFAULT 1,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

// ✅ SQL query to create the 'users' table
const userTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  mobile VARCHAR(15),
  password VARCHAR(255) NOT NULL,
  userType ENUM('user', 'superAdmin', 'clubAdmin') DEFAULT 'user',
  clubId INT DEFAULT NULL,
  MFA TINYINT(1) DEFAULT 0,
  isActive TINYINT(1) DEFAULT 1,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clubId) REFERENCES clubs(ClubID) ON DELETE SET NULL
);`;

// ✅ SQL query to create the 'books' table
const bookTableQuery = `CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  cover VARCHAR(255),
  genre VARCHAR(100),
  description TEXT,
  book_condition ENUM('New','Good','Fair','Worn') DEFAULT 'Good',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unique_id VARCHAR(255) UNIQUE,
  owner_id INT,
  clubId INT,
  status ENUM('Available','Unavailable') DEFAULT 'Available',
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (clubId) REFERENCES clubs(ClubID) ON DELETE SET NULL
);`;

// ✅ SQL query to create the 'notifications' table
const notificationTableQuery = `CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notification_id VARCHAR(50) UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

// ✅ SQL query to create the 'transactions' table
const transactionTableQuery = `CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT,
  borrower_id INT,
  owner_id INT,
  current_holder_id INT,
  status ENUM('Requested','Approved','Returned','Overdue','Cancelled') DEFAULT 'Requested',
  request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  approval_date DATETIME,
  return_date DATETIME,
  due_date DATETIME,
  cancel_reason VARCHAR(255),
  transaction_id VARCHAR(50) UNIQUE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (current_holder_id) REFERENCES users(id) ON DELETE SET NULL
);`;

// Function to create a table based on the provided query
const createTable = async (tableName, query) => {
  try {
    await pool.query(query);
    console.log(`${tableName} table created or already exists`);
  } catch (error) {
    console.log(`Error creating ${tableName}`, error);
  }
};

// Function to create all necessary tables
const createAllTable = async () => {
  try {
    await createTable("Clubs", clubTableQuery);          // Create 'clubs' table first
    await createTable("Users", userTableQuery);          // Then 'users' table
    await createTable("Books", bookTableQuery);          // Create 'books' table
    await createTable("Notifications", notificationTableQuery); // Create 'notifications' table
    await createTable("Transactions", transactionTableQuery);   // Create 'transactions' table
    console.log("All tables created successfully!!");
  } catch (error) {
    console.log("Error creating tables", error);
    throw error;
  }
};

// Export the createAllTable function
export default createAllTable;
