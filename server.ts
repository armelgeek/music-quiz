import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Setup socket handlers
  setupSocketHandlers(io);

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.IO server initialized');
    });
});

function setupSocketHandlers(io: Server) {
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
}