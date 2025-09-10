import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { db } from './drizzle/db';
import { quizHostSessions, quizHostParticipants } from './drizzle/schema';
import { eq, and } from 'drizzle-orm';

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

async function setupSocketHandlers(io: Server) {
  // Host session namespace for real-time quiz hosting
  const hostNamespace = io.of('/host-sessions');

  hostNamespace.on('connection', (socket) => {
    console.log('Host session client connected:', socket.id);

    // Join a specific session room
    socket.on('join-session', async (sessionCode: string) => {
      socket.join(sessionCode);
      console.log(`Client ${socket.id} joined session ${sessionCode}`);
      
      // Send current participants to the newly joined client
      try {
        const [session] = await db
          .select()
          .from(quizHostSessions)
          .where(and(
            eq(quizHostSessions.sessionCode, sessionCode),
            eq(quizHostSessions.isActive, true)
          ));

        if (session) {
          const participants = await db
            .select()
            .from(quizHostParticipants)
            .where(eq(quizHostParticipants.hostSessionId, session.id));

          socket.emit('session-participants', participants.map(p => ({
            participantId: p.id,
            participantName: p.participantName,
            score: p.currentScore,
            isConnected: p.isConnected,
          })));
        }
      } catch (error) {
        console.error('Error fetching participants for session:', error);
      }
      
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
    socket.on('participant-join', async (data) => {
      const { sessionCode, participantName, participantId } = data;
      socket.join(sessionCode);
      
      try {
        // Update participant connection status in database
        if (participantId) {
          await db
            .update(quizHostParticipants)
            .set({ isConnected: true })
            .where(eq(quizHostParticipants.id, participantId));
        }
        
        // Broadcast to all clients in the session including host
        hostNamespace.to(sessionCode).emit('participant-joined', {
          participantName,
          participantId,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error updating participant connection:', error);
      }
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

    socket.on('participant-leave', async (data) => {
      const { sessionCode, participantId, participantName } = data;
      socket.leave(sessionCode);
      
      try {
        // Update participant connection status in database
        if (participantId) {
          await db
            .update(quizHostParticipants)
            .set({ isConnected: false })
            .where(eq(quizHostParticipants.id, participantId));
        }
        
        // Notify all clients in the session including host
        hostNamespace.to(sessionCode).emit('participant-left', {
          participantId,
          participantName,
          timestamp: Date.now()
        });
        
        console.log(`Participant ${participantName} left session ${sessionCode}`);
      } catch (error) {
        console.error('Error updating participant leave status:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log('Host session client disconnected:', socket.id);
      
      // Note: In a production app, you might want to track which participant
      // disconnected and update their connection status in the database
      // This could be enhanced to automatically mark participants as disconnected
      // when they close their browser/app without explicitly leaving
    });
  });
}