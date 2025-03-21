// app.js
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import { checkConnection } from './config/db.js';
import createAllTable from './utils/dbUtils.js';
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import clubRoutes from './routes/clubRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";
import cors from 'cors'

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies


app.use('/api/users', userRoutes); // Use user routes for API calls
app.use('/api/auth', authRoutes); // Use auth routes for API calls
app.use('/api/books', bookRoutes); // Use book routes for API calls
app.use("/api/clubs", clubRoutes); // Use club routes for API calls
app.use('/api/transactions', transactionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewsRoutes);


app.listen(5000, async() => {
  console.log('Server running on port 5000');
  try {
    await checkConnection();
    await createAllTable();
  } catch (error) {
    console.log("Failed to initialize the database",error);
    
  }
});

