import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jobRoutes from './routes/jobs';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests with more details
app.use((req, res, next) => {
  console.log('----------------------------------------');
  console.log('Request received:');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('----------------------------------------');
  next();
});

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/outlaw')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('----------------------------------------');
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the server at http://localhost:${PORT}/test`);
  console.log(`Register endpoint at http://localhost:${PORT}/api/auth/register`);
  console.log('----------------------------------------');
}); 