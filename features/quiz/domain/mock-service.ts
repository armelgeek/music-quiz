// Mock data service for demonstration purposes
// In production, this would connect to the actual database

interface MockCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface MockQuestion {
  id: string;
  categoryId?: string;
  type: 'multiple_choice' | 'true_false' | 'audio_recognition';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit: number;
  artistInfo?: any;
  isActive: boolean;
}

interface MockSession {
  id: string;
  userId: string;
  categoryId?: string;
  totalQuestions: number;
  startedAt: Date;
  isCompleted: boolean;
}

interface MockAnswer {
  sessionId: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
}

// Mock data storage
const mockCategories: MockCategory[] = [
  {
    id: '1',
    name: 'Pop Music',
    description: 'Test your knowledge of popular music from the 70s to today',
    isActive: true,
  },
  {
    id: '2',
    name: 'Rock & Alternative',
    description: 'Classic rock, alternative rock, and everything in between',
    isActive: true,
  },
  {
    id: '3',
    name: 'Hip-Hop & R&B',
    description: 'Urban music, rap, and rhythm & blues',
    isActive: true,
  },
];

const mockQuestions: MockQuestion[] = [
  {
    id: '1',
    categoryId: '1',
    type: 'multiple_choice',
    difficulty: 'easy',
    question: 'Which artist released the album "Thriller" in 1982?',
    options: ['Michael Jackson', 'Prince', 'Madonna', 'Whitney Houston'],
    correctAnswer: 'Michael Jackson',
    explanation: 'Michael Jackson\'s "Thriller" became the best-selling album of all time.',
    points: 10,
    timeLimit: 30,
    artistInfo: {
      artist: 'Michael Jackson',
      album: 'Thriller',
      year: 1982,
      genre: 'Pop'
    },
    isActive: true,
  },
  {
    id: '2',
    categoryId: '2',
    type: 'true_false',
    difficulty: 'easy',
    question: 'The Beatles were formed in Liverpool, England.',
    correctAnswer: 'True',
    explanation: 'The Beatles were indeed formed in Liverpool in 1960.',
    points: 10,
    timeLimit: 20,
    artistInfo: {
      artist: 'The Beatles',
      genre: 'Rock'
    },
    isActive: true,
  },
  {
    id: '3',
    categoryId: '2',
    type: 'multiple_choice',
    difficulty: 'medium',
    question: 'What year was "Bohemian Rhapsody" by Queen released?',
    options: ['1975', '1976', '1977', '1978'],
    correctAnswer: '1975',
    explanation: '"Bohemian Rhapsody" was released in 1975 as part of the album "A Night at the Opera".',
    points: 15,
    timeLimit: 30,
    artistInfo: {
      artist: 'Queen',
      song: 'Bohemian Rhapsody',
      album: 'A Night at the Opera',
      year: 1975,
      genre: 'Rock'
    },
    isActive: true,
  },
  {
    id: '4',
    categoryId: '3',
    type: 'multiple_choice',
    difficulty: 'medium',
    question: 'Which rapper released the album "The Chronic" in 1992?',
    options: ['Snoop Dogg', 'Dr. Dre', 'Ice Cube', 'Eazy-E'],
    correctAnswer: 'Dr. Dre',
    explanation: '"The Chronic" was Dr. Dre\'s debut solo album and helped launch G-funk.',
    points: 15,
    timeLimit: 30,
    artistInfo: {
      artist: 'Dr. Dre',
      album: 'The Chronic',
      year: 1992,
      genre: 'Hip-Hop'
    },
    isActive: true,
  },
  {
    id: '5',
    categoryId: '1',
    type: 'true_false',
    difficulty: 'easy',
    question: 'Madonna is known as the "Queen of Pop".',
    correctAnswer: 'True',
    explanation: 'Madonna earned this title through her influence on pop music and culture.',
    points: 10,
    timeLimit: 20,
    artistInfo: {
      artist: 'Madonna',
      genre: 'Pop'
    },
    isActive: true,
  },
];

const mockSessions: MockSession[] = [];
const mockAnswers: MockAnswer[] = [];
const mockLeaderboard: any[] = [];

export class MockQuizService {
  // Get all active quiz categories
  async getCategories() {
    return mockCategories.filter(c => c.isActive);
  }

  // Get all questions for admin (not random/limited)
  async getAllQuestions(categoryId?: string) {
    let questions = mockQuestions.filter(q => q.isActive);
    
    if (categoryId) {
      questions = questions.filter(q => q.categoryId === categoryId);
    }

    return questions;
  }

  // Create a new question
  async createQuestion(questionData: Partial<MockQuestion>) {
    const newQuestion: MockQuestion = {
      id: `question_${Date.now()}`,
      categoryId: questionData.categoryId,
      type: questionData.type || 'multiple_choice',
      difficulty: questionData.difficulty || 'medium',
      question: questionData.question || '',
      options: questionData.options,
      correctAnswer: questionData.correctAnswer || '',
      explanation: questionData.explanation,
      points: questionData.points || 10,
      timeLimit: questionData.timeLimit || 30,
      artistInfo: questionData.artistInfo,
      isActive: questionData.isActive !== undefined ? questionData.isActive : true,
    };

    mockQuestions.push(newQuestion);
    return newQuestion;
  }

  // Update an existing question
  async updateQuestion(questionId: string, updateData: Partial<MockQuestion>) {
    const questionIndex = mockQuestions.findIndex(q => q.id === questionId);
    
    if (questionIndex === -1) {
      return null;
    }

    const existingQuestion = mockQuestions[questionIndex];
    const updatedQuestion: MockQuestion = {
      ...existingQuestion,
      ...updateData,
      id: questionId, // Ensure ID doesn't change
    };

    mockQuestions[questionIndex] = updatedQuestion;
    return updatedQuestion;
  }

  // Delete a question
  async deleteQuestion(questionId: string) {
    const questionIndex = mockQuestions.findIndex(q => q.id === questionId);
    
    if (questionIndex === -1) {
      return false;
    }

    mockQuestions.splice(questionIndex, 1);
    return true;
  }

  // Get random questions for a quiz session
  async getQuizQuestions(categoryId?: string, limit: number = 10) {
    let questions = mockQuestions.filter(q => q.isActive);
    
    if (categoryId) {
      questions = questions.filter(q => q.categoryId === categoryId);
    }

    // Shuffle and limit
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  // Create a new quiz session
  async createQuizSession(userId: string, categoryId?: string, totalQuestions: number = 10) {
    const session: MockSession = {
      id: `session_${Date.now()}`,
      userId,
      categoryId,
      totalQuestions,
      startedAt: new Date(),
      isCompleted: false,
    };

    mockSessions.push(session);
    return session;
  }

  // Get quiz session by ID
  async getQuizSession(sessionId: string) {
    return mockSessions.find(s => s.id === sessionId);
  }

  // Submit an answer for a question
  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string,
    timeSpent: number
  ) {
    // Get the correct answer
    const question = mockQuestions.find(q => q.id === questionId);

    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    const pointsEarned = isCorrect ? question.points : 0;

    // Save the answer
    const answer: MockAnswer = {
      sessionId,
      questionId,
      userAnswer,
      isCorrect,
      pointsEarned,
      timeSpent,
    };

    mockAnswers.push(answer);

    return {
      ...answer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      artistInfo: question.artistInfo,
    };
  }

  // Complete a quiz session
  async completeQuizSession(sessionId: string) {
    // Calculate session statistics
    const answers = mockAnswers.filter(a => a.sessionId === sessionId);

    const totalScore = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const totalTimeSpent = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);

    // Update session
    const session = mockSessions.find(s => s.id === sessionId);
    if (session) {
      session.isCompleted = true;
    }

    // Add to leaderboard
    const accuracy = Math.round((correctAnswers / answers.length) * 100);
    
    const leaderboardEntry = {
      id: `lb_${Date.now()}`,
      userId: session?.userId,
      sessionId,
      score: totalScore,
      totalQuestions: answers.length,
      accuracy,
      timeSpent: totalTimeSpent,
      createdAt: new Date(),
    };

    mockLeaderboard.push(leaderboardEntry);

    return {
      sessionId,
      totalScore,
      totalQuestions: answers.length,
      correctAnswers,
      accuracy,
      timeSpent: totalTimeSpent,
    };
  }

  // Get leaderboard
  async getLeaderboard(categoryId?: string, limit: number = 10) {
    // Sort by score descending, then by time ascending
    const sorted = [...mockLeaderboard].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSpent - b.timeSpent;
    });

    return sorted.slice(0, limit).map((entry, index) => ({
      id: entry.id,
      userName: `Player ${entry.userId?.slice(-8) || 'Unknown'}`,
      score: entry.score,
      accuracy: entry.accuracy,
      timeSpent: entry.timeSpent,
      createdAt: entry.createdAt.toISOString(),
      rank: index + 1,
    }));
  }

  // Get user stats
  async getUserStats(userId: string) {
    const userSessions = mockSessions.filter(s => s.userId === userId && s.isCompleted);
    const userLeaderboard = mockLeaderboard.filter(l => l.userId === userId);

    const totalQuizzes = userSessions.length;
    const averageScore = userLeaderboard.reduce((sum, entry) => sum + entry.score, 0) / totalQuizzes || 0;
    const bestScore = Math.max(...userLeaderboard.map(entry => entry.score), 0);
    const totalTimePlayed = userLeaderboard.reduce((sum, entry) => sum + entry.timeSpent, 0);

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      bestScore,
      totalTimePlayed,
    };
  }
}