import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiResponse } from 'next';

export interface SocketServerResponse extends NextApiResponse {
  socket: {
    server: HTTPServer & {
      io?: Server;
    };
  };
}

// Initialize Socket.IO server
export function initSocketServer(res: SocketServerResponse) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Host session namespace for real-time quiz hosting
    const hostNamespace = io.of('/host-sessions');

    hostNamespace.on('connection', (socket) => {
      console.log('Host session client connected:', socket.id);

      // Join a specific session room
      socket.on('join-session', (sessionCode: string) => {
        socket.join(sessionCode);
        console.log(`Client ${socket.id} joined session ${sessionCode}`);
        socket.emit('joined-session', sessionCode);
      });

      // Leave a session room
      socket.on('leave-session', (sessionCode: string) => {
        socket.leave(sessionCode);
        console.log(`Client ${socket.id} left session ${sessionCode}`);
      });

      // Host events
      socket.on('host-start-session', (data) => {
        const { sessionCode } = data;
        hostNamespace.to(sessionCode).emit('session-started', data);
      });

      socket.on('host-end-session', (data) => {
        const { sessionCode } = data;
        hostNamespace.to(sessionCode).emit('session-ended', data);
      });

      socket.on('host-next-question', (data) => {
        const { sessionCode, question, timeLimit } = data;
        hostNamespace.to(sessionCode).emit('question-started', {
          question,
          timeLimit,
          startTime: Date.now()
        });
      });

      socket.on('host-show-results', (data) => {
        const { sessionCode, results } = data;
        hostNamespace.to(sessionCode).emit('question-results', results);
      });

      socket.on('host-show-leaderboard', (data) => {
        const { sessionCode, leaderboard } = data;
        hostNamespace.to(sessionCode).emit('leaderboard-updated', leaderboard);
      });

      // Participant events
      socket.on('participant-join', (data) => {
        const { sessionCode, participantName, participantId } = data;
        socket.join(sessionCode);
        hostNamespace.to(sessionCode).emit('participant-joined', {
          participantName,
          participantId,
          timestamp: Date.now()
        });
      });

      socket.on('participant-answer', (data) => {
        const { sessionCode, participantId, answer, questionId } = data;
        // Broadcast to host only (not all participants)
        socket.to(sessionCode).emit('participant-answered', {
          participantId,
          answer,
          questionId,
          timestamp: Date.now()
        });
      });

      socket.on('disconnect', () => {
        console.log('Host session client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
    console.log('Socket.IO server initialized with host sessions namespace');
  }

  return res.socket.server.io;
}

// Event types for type safety
export interface HostSessionEvents {
  'session-started': (data: { sessionCode: string; sessionName: string }) => void;
  'session-ended': (data: { sessionCode: string }) => void;
  'question-started': (data: { question: any; timeLimit: number; startTime: number }) => void;
  'question-results': (data: { correct_answer: string; explanation?: string }) => void;
  'leaderboard-updated': (data: Array<{ participantId: string; participantName: string; score: number }>) => void;
  'participant-joined': (data: { participantName: string; participantId: string; timestamp: number }) => void;
  'participant-answered': (data: { participantId: string; answer: string; questionId: string; timestamp: number }) => void;
}