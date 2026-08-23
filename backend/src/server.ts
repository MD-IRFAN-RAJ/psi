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

      // Automatic health check ping to prevent the backend from sleeping.
      // Set SERVER_URL in your .env to the public URL (e.g. https://your-app.onrender.com)
      // for this to effectively prevent sleep on free tier hosts like Render.
      const pingInterval = 1000 * 60 * 60; // 1 hour
      setInterval(async () => {
        const url = process.env.SERVER_URL || `http://localhost:${PORT}`;
        try {
          const res = await fetch(`${url}/api/v1/health`);
          console.log(`[Health Ping] ${new Date().toISOString()} - Status: ${res.status}`);
        } catch (error: any) {
          console.error(`[Health Ping] Error:`, error.message);
        }
      }, pingInterval);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
