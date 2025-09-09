import { db } from '@/drizzle/db';
import { 
  quizCategories, 
  quizQuestions, 
  quizSessions, 
  quizAnswers, 
  quizLeaderboard 
} from '@/drizzle/schema';
import { eq, and, desc, asc, count, avg, sum } from 'drizzle-orm';
import { QuizQuestion, QuizSession, QuizAnswer } from '../config/quiz.schema';
import { QuizResult, LeaderboardEntry } from '../config/quiz.types';

export class QuizService {
  // Get all active quiz categories
  async getCategories() {
    return await db
      .select()
      .from(quizCategories)
      .where(eq(quizCategories.isActive, true))
      .orderBy(asc(quizCategories.name));
  }

  // Get random questions for a quiz session
  async getQuizQuestions(categoryId?: string, limit: number = 10) {
    let whereClause = eq(quizQuestions.isActive, true);
    
    if (categoryId) {
      whereClause = and(
        eq(quizQuestions.isActive, true),
        eq(quizQuestions.categoryId, categoryId)
      ) as any;
    }

    // Get all available questions first, then randomize in JavaScript
    // In production, you'd want to use SQL RANDOM() for better performance
    const allQuestions = await db
      .select()
      .from(quizQuestions)
      .where(whereClause);

    // Shuffle and limit
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  // Create a new quiz session
  async createQuizSession(userId: string, categoryId?: string, totalQuestions: number = 10) {
    const [session] = await db
      .insert(quizSessions)
      .values({
        userId,
        categoryId,
        totalQuestions,
        startedAt: new Date(),
      })
      .returning();

    return session;
  }

  // Get quiz session by ID
  async getQuizSession(sessionId: string) {
    const [session] = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.id, sessionId));

    return session;
  }

  // Submit an answer for a question
  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string,
    timeSpent: number
  ) {
    // Get the correct answer
    const [question] = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, questionId));

    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    const pointsEarned = isCorrect ? question.points : 0;

    // Save the answer
    const [answer] = await db
      .insert(quizAnswers)
      .values({
        sessionId,
        questionId,
        userAnswer,
        isCorrect,
        pointsEarned,
        timeSpent,
      })
      .returning();

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
    const answers = await db
      .select()
      .from(quizAnswers)
      .where(eq(quizAnswers.sessionId, sessionId));

    const totalScore = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const totalTimeSpent = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);

    // Update session
    const [updatedSession] = await db
      .update(quizSessions)
      .set({
        completedAt: new Date(),
        totalScore,
        correctAnswers,
        timeSpent: totalTimeSpent,
        isCompleted: true,
      })
      .where(eq(quizSessions.id, sessionId))
      .returning();

    // Add to leaderboard
    const accuracy = Math.round((correctAnswers / answers.length) * 100);
    
    await db.insert(quizLeaderboard).values({
      userId: updatedSession.userId!,
      categoryId: updatedSession.categoryId,
      sessionId,
      score: totalScore,
      totalQuestions: answers.length,
      accuracy,
      timeSpent: totalTimeSpent,
    });

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
    const query = db
      .select({
        id: quizLeaderboard.id,
        userName: quizLeaderboard.userId, // We'll need to join with users table
        score: quizLeaderboard.score,
        accuracy: quizLeaderboard.accuracy,
        timeSpent: quizLeaderboard.timeSpent,
        createdAt: quizLeaderboard.createdAt,
      })
      .from(quizLeaderboard)
      .orderBy(desc(quizLeaderboard.score), asc(quizLeaderboard.timeSpent))
      .limit(limit);

    if (categoryId) {
      query.where(eq(quizLeaderboard.categoryId, categoryId));
    }

    return await query;
  }

  // Get user stats
  async getUserStats(userId: string) {
    const sessions = await db
      .select()
      .from(quizSessions)
      .where(and(
        eq(quizSessions.userId, userId),
        eq(quizSessions.isCompleted, true)
      ));

    const totalQuizzes = sessions.length;
    const averageScore = sessions.reduce((sum, session) => sum + session.totalScore, 0) / totalQuizzes || 0;
    const bestScore = Math.max(...sessions.map(session => session.totalScore), 0);
    const totalTimePlayed = sessions.reduce((sum, session) => sum + session.timeSpent, 0);

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      bestScore,
      totalTimePlayed,
    };
  }
}