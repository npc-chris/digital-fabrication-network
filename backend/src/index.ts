import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import { initializeWebSocket } from './config/websocket';
import servicesRoutes from './routes/services.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import locationsRoutes from './routes/locations.routes';
import waitlistRoutes from './routes/waitlist.routes';
import qcRoutes from './routes/qc.routes';
import blogRoutes from './routes/blog.routes';
import queueRoutes from './routes/queue.routes';
import gatewayRoutes, { topologyHandler, healthProbeHandler } from './routes/gateway.routes';
import { connectRedis, getOptionalRedisClient } from './config/redis';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize WebSocket
const io = initializeWebSocket(httpServer);
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
const uploadsDir = process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check & Product-Line Topology / Load-Balancer Probes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'dfn-platform-gateway',
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/gateway/topology', topologyHandler);
app.get('/api/gateway/health', healthProbeHandler);

// Platform-owned routes (landing/waitlist, blog CMS, queueing, catalog, uploads, locations, QC, admin)
app.use('/api/services', servicesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/gateway/queue', queueRoutes);
app.use('/api/v1/queue', queueRoutes);
app.use('/api/qc', qcRoutes);
app.use('/api/v1/qc', qcRoutes);

// Load-balanced gateway routing to dfn-digisec, dfn-finworld, dfn-discovery & dfn-prism
app.use('/api', gatewayRoutes);


// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    if (getOptionalRedisClient()) {
      try {
        await connectRedis();
        console.log('Redis connected successfully');
      } catch (error) {
        console.warn('Redis connection failed, continuing without cache:', error);
      }
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

if (require.main === module) {
  startServer();
}

export default app;
