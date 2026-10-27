const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const Movie = require('./models/Movie');
const seedDatabase = require('./scripts/seed');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB (Atlas or In-Memory fallback)
    await connectDB();

    // 2. Check if database is empty; if so, seed initial demo data
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Server] Database is empty. Automatically initializing demo data...');
      await seedDatabase();
    } else {
      console.log(`[Server] Database contains ${movieCount} movies. Ready.`);
    }

    // 3. Start HTTP server
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🎬 IMovies Backend REST API running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🚀 Server listening on: http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('[Server] Unhandled Rejection:', err);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Server] SIGTERM received. Closing HTTP server gracefully...');
      server.close(() => {
        console.log('[Server] Process terminated.');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('[Server] Failed to launch server:', err.message);
    process.exit(1);
  }
};

startServer();
