import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import passport from './config/passport';
import { initializeWebSocket } from './config/websocket';
import authRoutes from './routes/auth.routes';
import componentsRoutes from './routes/components.routes';
import servicesRoutes from './routes/services.routes';
import ordersRoutes from './routes/orders.routes';
import bookingsRoutes from './routes/bookings.routes';
import communityRoutes from './routes/community.routes';
import wishlistRoutes from './routes/wishlist.routes';
import searchRoutes from './routes/search.routes';
import notificationsRoutes from './routes/notifications.routes';
import quotesRoutes from './routes/quotes.routes';
import uploadRoutes from './routes/upload.routes';
import profilesRoutes from './routes/profiles.routes';
// New strategic feature routes
import projectsRoutes from './routes/projects.routes';
import cartRoutes from './routes/cart.routes';
import affiliatesRoutes from './routes/affiliates.routes';
import forumRoutes from './routes/forum.routes';
import mentorshipRoutes from './routes/mentorship.routes';
import groupbuyingRoutes from './routes/groupbuying.routes';
import verificationRoutes from './routes/verification.routes';
import { connectRedis } from './config/redis';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize WebSocket
initializeWebSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Serve static files from uploads directory
const uploadsDir = process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/components', componentsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/upload', uploadRoutes);
// New strategic feature routes
app.use('/api/projects', projectsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/affiliates', affiliatesRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/group-buying', groupbuyingRoutes);
app.use('/api/verification', verificationRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis (optional, will continue without it)
    try {
      await connectRedis();
      console.log('Redis connected successfully');
    } catch (error) {
      console.warn('Redis connection failed, continuing without cache:', error);
    }

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`WebSocket server initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
