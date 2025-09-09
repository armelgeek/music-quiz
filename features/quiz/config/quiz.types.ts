export interface QuizState {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  timeRemaining: number;
  isActive: boolean;
  answers: QuizAnswerState[];
}

export interface QuizAnswerState {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
}

export interface QuizResult {
  sessionId: string;
  totalScore: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  rank?: number;
  feedback: string;
}

export interface LeaderboardEntry {
  id: string;
  userName: string;
  userImage?: string;
  score: number;
  accuracy: number;
  timeSpent: number;
  categoryName?: string;
  createdAt: Date;
  rank: number;
}

export interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimePlayed: number;
  favoriteCategory?: string;
  improvementTrend: number;
}

export type QuestionType = 'multiple_choice' | 'audio_recognition' | 'true_false';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';