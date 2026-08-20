import http from 'http';
import cron from 'node-cron';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { prisma } from './config/database.js';
import { setupPitchRoomSocket } from './sockets/pitchRoom.socket.js';

const PORT = process.env.PORT || 3001;
const app = createApp();
const server = http.createServer(app);

// Setup Socket.IO Server
const io = new SocketIOServer(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupPitchRoomSocket(io);

// Automated Daily Maintenance Worker (Runs at 03:00 AM every day)
cron.schedule('0 3 * * *', async () => {
  try {
    const cutoffDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
    const deletedTokens = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: cutoffDate } },
        ],
      },
    });
    console.log(`🧹 [CRON MAINTENANCE] Purged ${deletedTokens.count} expired/revoked refresh tokens.`);
  } catch (err) {
    console.error('⚠️ [CRON MAINTENANCE ERROR]:', err);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Incubator API & WebSockets running at http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server ready for realtime pitch sessions`);
  console.log(`⏰ Daily database maintenance cron scheduled`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

