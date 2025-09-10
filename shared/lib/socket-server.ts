// Event types for type safety with Socket.IO
export interface HostSessionEvents {
  'session-started': (data: { sessionCode: string; sessionName: string }) => void;
  'session-ended': (data: { sessionCode: string }) => void;
  'question-started': (data: { question: any; timeLimit: number; startTime: number }) => void;
  'question-results': (data: { correct_answer: string; explanation?: string }) => void;
  'leaderboard-updated': (data: Array<{ participantId: string; participantName: string; score: number }>) => void;
  'participant-joined': (data: { participantName: string; participantId: string; timestamp: number }) => void;
  'participant-left': (data: { participantId: string; participantName: string; timestamp: number }) => void;
  'participant-answered': (data: { participantId: string; answer: string; questionId: string; timestamp: number }) => void;
}