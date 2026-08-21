import http from 'http';
import cron from 'node-cron';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { prisma } from './config/database.js';
import { redis } from './config/redis.js';
import { setupPitchRoomSocket } from './sockets/pitchRoom.socket.js';

const PORT = process.env.PORT || 3001;
const app = createApp();
const server = http.createServer(app);

// Setup Socket.IO Server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:3000'],
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
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} recibido. Cerrando servidor gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('✅ Prisma desconectado');
      await redis.quit();
      console.log('✅ Redis desconectado');
    } catch (err) {
      console.error('⚠️ Error durante el cierre:', err);
    }
    console.log('✅ Proceso terminado correctamente.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
