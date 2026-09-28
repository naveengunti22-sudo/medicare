import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { db } from './db.js';

interface RoomParticipant {
  socketId: string;
  userId: string;
  name: string;
  role: string;
  isVideoMuted?: boolean;
  isAudioMuted?: boolean;
  connectionQuality?: 'EXCELLENT' | 'UNSTABLE' | 'POOR';
  mode?: 'VIDEO' | 'AUDIO' | 'CHAT';
}

const activeRooms: Record<string, RoomParticipant[]> = {};

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    // 1. Join user private notification channel
    socket.on('join-user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // 2. Doctor status update
    socket.on('update-doctor-status', ({ doctorId, status }: { doctorId: string; status: string }) => {
      const doc = db.findDoctorById(doctorId);
      if (doc) {
        doc.currentStatus = status as any;
        io.emit('doctor-status-changed', {
          doctorId,
          status,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    // 3. Queue update broadcast
    socket.on('refresh-queue', ({ doctorId }: { doctorId: string }) => {
      io.emit(`queue-updated:${doctorId}`, { doctorId, timestamp: Date.now() });
    });

    // 4. WebRTC Video Consultation Room Signaling
    socket.on('join-consultation-room', ({ roomId, userId, name, role }: { roomId: string; userId: string; name: string; role: string }) => {
      socket.join(roomId);
      if (!activeRooms[roomId]) {
        activeRooms[roomId] = [];
      }

      // Remove existing stale participant with same userId or socketId
      activeRooms[roomId] = activeRooms[roomId].filter((p) => p.socketId !== socket.id && p.userId !== userId);

      const participant: RoomParticipant = {
        socketId: socket.id,
        userId,
        name,
        role,
        isVideoMuted: false,
        isAudioMuted: false,
        connectionQuality: 'EXCELLENT',
        mode: 'VIDEO',
      };
      activeRooms[roomId].push(participant);

      // Notify others in room
      socket.to(roomId).emit('user-joined-room', participant);

      // Send existing participants to the joined user
      const existingOthers = activeRooms[roomId].filter((p) => p.socketId !== socket.id);
      socket.emit('room-participants', existingOthers);
    });

    // WebRTC Offer
    socket.on('webrtc-offer', ({ roomId, sdp, targetSocketId }: { roomId: string; sdp: any; targetSocketId?: string }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-offer', { sdp, senderSocketId: socket.id });
      } else {
        socket.to(roomId).emit('webrtc-offer', { sdp, senderSocketId: socket.id });
      }
    });

    // WebRTC Answer
    socket.on('webrtc-answer', ({ roomId, sdp, targetSocketId }: { roomId: string; sdp: any; targetSocketId?: string }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-answer', { sdp, senderSocketId: socket.id });
      } else {
        socket.to(roomId).emit('webrtc-answer', { sdp, senderSocketId: socket.id });
      }
    });

    // ICE Candidate
    socket.on('ice-candidate', ({ roomId, candidate, targetSocketId }: { roomId: string; candidate: any; targetSocketId?: string }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', { candidate, senderSocketId: socket.id });
      } else {
        socket.to(roomId).emit('ice-candidate', { candidate, senderSocketId: socket.id });
      }
    });

    // In-room chat messages
    socket.on('consultation-chat', ({ roomId, message, senderName, senderRole }: { roomId: string; message: string; senderName: string; senderRole: string }) => {
      io.in(roomId).emit('consultation-chat', {
        id: `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        roomId,
        message,
        senderName,
        senderRole,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    // Media & connectivity fallback state change (e.g. video muted, audio fallback, poor network quality)
    socket.on('media-state-change', ({ roomId, isVideoMuted, isAudioMuted, connectionQuality, mode }: any) => {
      if (activeRooms[roomId]) {
        const p = activeRooms[roomId].find((part) => part.socketId === socket.id);
        if (p) {
          if (isVideoMuted !== undefined) p.isVideoMuted = isVideoMuted;
          if (isAudioMuted !== undefined) p.isAudioMuted = isAudioMuted;
          if (connectionQuality !== undefined) p.connectionQuality = connectionQuality;
          if (mode !== undefined) p.mode = mode;
        }
      }

      socket.to(roomId).emit('participant-media-changed', {
        socketId: socket.id,
        isVideoMuted,
        isAudioMuted,
        connectionQuality,
        mode,
      });
    });

    // Leave room / disconnect
    const handleLeave = () => {
      for (const roomId in activeRooms) {
        const idx = activeRooms[roomId].findIndex((p) => p.socketId === socket.id);
        if (idx !== -1) {
          const removed = activeRooms[roomId].splice(idx, 1)[0];
          socket.to(roomId).emit('user-left-room', { socketId: socket.id, userId: removed.userId });
        }
      }
    };

    socket.on('leave-room', handleLeave);
    socket.on('disconnect', handleLeave);
  });

  return io;
}
