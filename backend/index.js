import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import path from 'path';
import bookRoutes from './src/routes/bookRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// ✅ Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mySql@345",
  database: "booklearning",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  } else {
    console.log("Connected to MySQL Database.");
  }
});

// ✅ Use Routes
app.use('/api/books', bookRoutes);

// ✅ Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000.");
});