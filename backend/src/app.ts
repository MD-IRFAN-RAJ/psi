import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { StatusCodes } from 'http-status-codes';
import 'express-async-errors'; // Handles async errors in express routes

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import sprintRoutes from './routes/sprintRoutes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Initialize Express app
const app = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// Routes
// Health Check Endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ status: 'UP', message: 'TaskSuite API is running smoothly.' });
});

// Authentication Routes
app.use('/api/v1/auth', authRoutes);

// Task Routes
app.use('/api/v1/tasks', taskRoutes);

// User Routes
app.use('/api/v1/users', userRoutes);

// Project Routes
app.use('/api/v1/projects', projectRoutes);

// Sprint Routes
app.use('/api/v1/sprints', sprintRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Future routes will be mounted here

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = (err as any).statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    error: statusCode === StatusCodes.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : 'Request failed',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

export default app;
