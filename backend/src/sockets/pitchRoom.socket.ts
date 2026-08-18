import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { UserRole } from '@prisma/client';

export interface AuthenticatedSocketUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface RoomState {
  hostUserId: string;
  participants: Map<string, { socketId: string; userId: string; name: string; role: string }>;
  isPitchActive: boolean;
  timerInterval: NodeJS.Timeout | null;
  remainingSeconds: number;
}

const rooms = new Map<string, RoomState>();

export const setupPitchRoomSocket = (io: Server) => {
  // 1. Mandatory JWT Authentication Middleware on Handshake
  io.use(async (socket: Socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error('AUTHENTICATION_ERROR: Token de acceso no proporcionado'));
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret && process.env.NODE_ENV === 'production') {
        return next(new Error('SERVER_CONFIG_ERROR: JWT_ACCESS_SECRET no configurada'));
      }
      const jwtSecret = secret || 'dev-jwt-access-secret-key-32-chars-long-min';

      const decoded = jwt.verify(token, jwtSecret) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return next(new Error('AUTHENTICATION_ERROR: Usuario no válido o inactivo'));
      }

      socket.data.user = {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
      } as AuthenticatedSocketUser;

      next();
    } catch (err: any) {
      return next(new Error('AUTHENTICATION_ERROR: Token inválido o expirado'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const currentUser: AuthenticatedSocketUser = socket.data.user;
    let currentRoomId: string | null = null;

    socket.on('room:join', async ({ roomId }: { roomId: string }) => {
      if (!roomId) return;
      currentRoomId = roomId;

      // Verify room existence in DB
      let hostUserId = '';
      try {
        const roomDb = await prisma.room.findFirst({
          where: {
            OR: [{ id: roomId }, { accessCode: roomId }],
          },
          include: {
            pitchSession: {
              include: {
                startup: true,
              },
            },
          },
        });

        if (roomDb) {
          hostUserId = roomDb.pitchSession.startup.userId;
          // Record participant in DB asynchronously
          prisma.roomParticipant.create({
            data: {
              roomId: roomDb.id,
              userId: currentUser.id,
            },
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Could not verify room in DB:', err);
      }

      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          hostUserId,
          participants: new Map(),
          isPitchActive: false,
          timerInterval: null,
          remainingSeconds: 300, // default 5 minutes
        });
      }

      const room = rooms.get(roomId)!;
      room.participants.set(socket.id, {
        socketId: socket.id,
        userId: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
      });

      const participantList = Array.from(room.participants.values());

      // Confirm join to caller with verified credentials
      socket.emit('room:joined', {
        roomId,
        users: participantList,
        isPitchActive: room.isPitchActive,
        remainingSeconds: room.remainingSeconds,
        currentUser,
      });

      // Notify others in room
      socket.to(roomId).emit('room:user-joined', {
        userId: currentUser.id,
        socketId: socket.id,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
        },
      });
    });

    socket.on('pitch:start', ({ roomId, durationSeconds = 300 }: { roomId: string; durationSeconds?: number }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // RBAC check: only host founder or ADMIN can start pitch
      const isHostOrAdmin = currentUser.role === 'ADMIN' || room.hostUserId === currentUser.id;
      if (!isHostOrAdmin) {
        socket.emit('error:permission', { message: 'Solo el presentador o administrador puede iniciar el pitch' });
        return;
      }

      if (room.timerInterval) {
        clearInterval(room.timerInterval);
      }

      const validDuration = [300, 600, 900, 1800].includes(durationSeconds) ? durationSeconds : 300;
      room.isPitchActive = true;
      room.remainingSeconds = validDuration;

      io.to(roomId).emit('pitch:started', {
        startTime: new Date(),
        durationSeconds: room.remainingSeconds,
      });

      room.timerInterval = setInterval(() => {
        room.remainingSeconds -= 1;

        io.to(roomId).emit('timer:tick', {
          remainingSeconds: room.remainingSeconds,
        });

        if (room.remainingSeconds === 60 || room.remainingSeconds === 30 || room.remainingSeconds === 10) {
          io.to(roomId).emit('timer:warning', {
            remainingSeconds: room.remainingSeconds,
          });
        }

        if (room.remainingSeconds <= 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          room.timerInterval = null;
          room.isPitchActive = false;
          io.to(roomId).emit('timer:expired');
          io.to(roomId).emit('pitch:ended', { reason: 'Tiempo de pitch finalizado' });
        }
      }, 1000);
    });

    socket.on('pitch:end', ({ roomId, reason = 'Presentación finalizada' }: { roomId: string; reason?: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // RBAC check
      const isHostOrAdmin = currentUser.role === 'ADMIN' || room.hostUserId === currentUser.id;
      if (!isHostOrAdmin) {
        socket.emit('error:permission', { message: 'Solo el presentador o administrador puede finalizar el pitch' });
        return;
      }

      if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
      }
      room.isPitchActive = false;

      io.to(roomId).emit('pitch:ended', { reason: reason.slice(0, 100) });
    });

    socket.on('chat:message', ({ roomId, content }: { roomId: string; content: string }) => {
      if (!content || typeof content !== 'string') return;
      const sanitizedContent = content.trim().slice(0, 1000);
      if (!sanitizedContent) return;

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sender: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        content: sanitizedContent,
        time: new Date(),
      };

      io.to(roomId).emit('chat:message', message);
    });

    // WebRTC Signaling Relay
    socket.on('media:offer', ({ target, sdp }: { target: string; sdp: any }) => {
      io.to(target).emit('media:offer', {
        sender: socket.id,
        user: currentUser,
        sdp,
      });
    });

    socket.on('media:answer', ({ target, sdp }: { target: string; sdp: any }) => {
      io.to(target).emit('media:answer', {
        sender: socket.id,
        user: currentUser,
        sdp,
      });
    });

    socket.on('media:ice-candidate', ({ target, candidate }: { target: string; candidate: any }) => {
      io.to(target).emit('media:ice-candidate', {
        sender: socket.id,
        candidate,
      });
    });

    // Cleanup on disconnect
    const handleLeave = () => {
      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId)!;
        room.participants.delete(socket.id);

        socket.to(currentRoomId).emit('room:user-left', {
          socketId: socket.id,
          userId: currentUser.id,
        });

        if (room.participants.size === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          rooms.delete(currentRoomId);
        }
      }
    };

    socket.on('room:leave', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};

