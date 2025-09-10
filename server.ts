import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { db } from './drizzle/db';
import { quizHostSessions, quizHostParticipants, quizHostAnswers, quizQuestions } from './drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

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
      
      // Start countdown for next question
      let countdown = 5;
      const countdownInterval = setInterval(() => {
        hostNamespace.to(sessionCode).emit('transition-countdown', {
          countdown,
          message: countdown > 0 ? 'Next question starting soon...' : 'Starting next question!'
        });
        
        countdown--;
        if (countdown < 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
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

    socket.on('participant-answer', async (data) => {
      const { sessionCode, participantId, answer, questionId } = data;
      
      try {
        // Get the session and question details
        const [session] = await db
          .select()
          .from(quizHostSessions)
          .where(and(
            eq(quizHostSessions.sessionCode, sessionCode),
            eq(quizHostSessions.isActive, true)
          ));

        if (!session) {
          console.error('Session not found:', sessionCode);
          return;
        }

        // Get the question details to check correct answer and calculate points
        const [question] = await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.id, questionId));

        if (!question) {
          console.error('Question not found:', questionId);
          return;
        }

        // Calculate if answer is correct and points earned
        const isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        const pointsEarned = isCorrect ? question.points : 0;

        // Save the answer to database
        await db.insert(quizHostAnswers).values({
          hostSessionId: session.id,
          participantId,
          questionId,
          userAnswer: answer,
          isCorrect,
          pointsEarned,
          timeSpent: 0, // This could be enhanced to track actual time spent
        });

        // Update participant's current score
        if (isCorrect && pointsEarned > 0) {
          await db
            .update(quizHostParticipants)
            .set({ 
              currentScore: (await db
                .select({ score: quizHostParticipants.currentScore })
                .from(quizHostParticipants)
                .where(eq(quizHostParticipants.id, participantId))
                .then(result => result[0]?.score || 0)
              ) + pointsEarned
            })
            .where(eq(quizHostParticipants.id, participantId));
        }

        // Get updated leaderboard
        const participants = await db
          .select()
          .from(quizHostParticipants)
          .where(eq(quizHostParticipants.hostSessionId, session.id))
          .orderBy(desc(quizHostParticipants.currentScore), quizHostParticipants.joinedAt);

        const leaderboard = participants.map((p, index) => ({
          rank: index + 1,
          participantId: p.id,
          participantName: p.participantName,
          score: p.currentScore
        }));

        // Broadcast updated leaderboard to all participants
        hostNamespace.to(sessionCode).emit('leaderboard-updated', leaderboard);

        // Broadcast to host that participant answered
        socket.to(sessionCode).emit('participant-answered', {
          participantId,
          answer,
          questionId,
          isCorrect,
          pointsEarned,
          timestamp: Date.now()
        });

        console.log(`Participant ${participantId} answered question ${questionId}: ${isCorrect ? 'correct' : 'incorrect'} (${pointsEarned} points)`);
      } catch (error) {
        console.error('Error processing participant answer:', error);
      }
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