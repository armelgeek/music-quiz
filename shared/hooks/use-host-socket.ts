import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { HostSessionEvents } from '@/shared/lib/socket-server';

// Custom hook for host session socket connection
export function useHostSocket(sessionCode?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Array<{
    participantId: string;
    participantName: string;
    score: number;
    isConnected: boolean;
  }>>([]);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('/host-sessions', {
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to host session socket');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from host session socket');
    });

    // Listen for participant events
    socketInstance.on('participant-joined', (data) => {
      console.log('Participant joined:', data);
      setParticipants(prev => {
        const existing = prev.find(p => p.participantId === data.participantId);
        if (existing) {
          return prev; // Already exists
        }
        return [...prev, {
          participantId: data.participantId,
          participantName: data.participantName,
          score: 0,
          isConnected: true,
        }];
      });
    });

    socketInstance.on('session-participants', (participantList) => {
      console.log('Received session participants:', participantList);
      setParticipants(participantList);
    });

    socketInstance.on('participant-left', (data) => {
      console.log('Participant left:', data);
      setParticipants(prev => 
        prev.filter(p => p.participantId !== data.participantId)
      );
      
      // Show notification that a participant left (optional, could use toast)
      console.log(`${data.participantName} left the session`);
    });

    socketInstance.on('participant-answered', (data) => {
      console.log('Participant answered:', data);
      // Update participant state if needed
    });

    // Join session room if sessionCode is provided
    if (sessionCode) {
      socketInstance.emit('join-session', sessionCode);
    }

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [sessionCode]);

  // Host functions
  const startSession = (sessionData: { sessionCode: string; sessionName: string }) => {
    socket?.emit('host-start-session', sessionData);
  };

  const endSession = (sessionCode: string) => {
    socket?.emit('host-end-session', { sessionCode });
  };

  const nextQuestion = (data: { sessionCode: string; question: any; timeLimit: number }) => {
    socket?.emit('host-next-question', data);
  };

  const showResults = (data: { sessionCode: string; results: any }) => {
    socket?.emit('host-show-results', data);
  };

  const showLeaderboard = (data: { sessionCode: string; leaderboard: any[] }) => {
    socket?.emit('host-show-leaderboard', data);
  };

  return {
    socket,
    isConnected,
    participants,
    startSession,
    endSession,
    nextQuestion,
    showResults,
    showLeaderboard,
  };
}

// Custom hook for participant socket connection
export function useParticipantSocket(sessionCode?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [sessionStatus, setSessionStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!sessionCode) return;

    // Initialize socket connection
    const socketInstance = io('/host-sessions', {
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to participant socket');
      
      // Join session room
      socketInstance.emit('join-session', sessionCode);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from participant socket');
    });

    // Listen for session events
    socketInstance.on('session-started', (data) => {
      setSessionStatus('active');
      console.log('Session started:', data);
    });

    socketInstance.on('session-ended', (data) => {
      setSessionStatus('ended');
      console.log('Session ended:', data);
    });

    socketInstance.on('question-started', (data) => {
      setCurrentQuestion(data);
      setResults(null); // Clear previous results
      console.log('New question:', data);
    });

    socketInstance.on('question-results', (data) => {
      setResults(data);
      console.log('Question results:', data);
    });

    socketInstance.on('leaderboard-updated', (data) => {
      setLeaderboard(data);
      console.log('Leaderboard updated:', data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [sessionCode]);

  const joinAsParticipant = (participantName: string, participantId: string) => {
    socket?.emit('participant-join', {
      sessionCode,
      participantName,
      participantId
    });
  };

  const submitAnswer = (answer: string, questionId: string, participantId: string) => {
    socket?.emit('participant-answer', {
      sessionCode,
      participantId,
      answer,
      questionId
    });
  };

  const leaveSession = (participantName: string, participantId: string) => {
    socket?.emit('participant-leave', {
      sessionCode,
      participantId,
      participantName
    });
  };

  return {
    socket,
    isConnected,
    currentQuestion,
    sessionStatus,
    leaderboard,
    results,
    joinAsParticipant,
    submitAnswer,
    leaveSession,
  };
}

// Hook for general socket event listening
export function useSocketEvent<K extends keyof HostSessionEvents>(
  socket: Socket | null,
  event: K,
  handler: HostSessionEvents[K]
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return;

    const eventHandler = (...args: any[]) => {
      handlerRef.current(...args);
    };

    socket.on(event, eventHandler);

    return () => {
      socket.off(event, eventHandler);
    };
  }, [socket, event]);
}