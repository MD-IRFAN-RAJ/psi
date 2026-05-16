import dotenv from 'dotenv';
// Load environment variables before importing anything else
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // In future stages, connect to DB here via Prisma
    // await prisma.$connect();
    // console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`[Server]: TaskSuite backend is running at http://localhost:${PORT}`);
      console.log(`[Server]: Health check available at http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
