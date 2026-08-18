import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { setupPitchRoomSocket } from './sockets/pitchRoom.socket.js';

const PORT = process.env.PORT || 3001;
const app = createApp();
const server = http.createServer(app);

// Setup Socket.IO Server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupPitchRoomSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Incubator API & WebSockets running at http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server ready for realtime pitch sessions`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
