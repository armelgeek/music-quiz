import { QuizService } from '../service';
import { QuizResult } from '../../config/quiz.types';

const quizService = new QuizService();

export interface CompleteQuizParams {
  sessionId: string;
}

export async function completeQuizUseCase({
  sessionId
}: CompleteQuizParams): Promise<QuizResult> {
  try {
    const result = await quizService.completeQuizSession(sessionId);
    
    // Generate feedback based on performance
    let feedback = '';
    const { accuracy, totalScore, correctAnswers, totalQuestions } = result;
    
    if (accuracy >= 90) {
      feedback = `Outstanding! You're a music expert! 🌟 ${correctAnswers}/${totalQuestions} correct with ${accuracy}% accuracy.`;
    } else if (accuracy >= 70) {
      feedback = `Great job! You know your music well! 🎵 ${correctAnswers}/${totalQuestions} correct with ${accuracy}% accuracy.`;
    } else if (accuracy >= 50) {
      feedback = `Not bad! Keep listening and learning! 🎧 ${correctAnswers}/${totalQuestions} correct with ${accuracy}% accuracy.`;
    } else {
      feedback = `Room for improvement! Keep exploring music! 🎼 ${correctAnswers}/${totalQuestions} correct with ${accuracy}% accuracy.`;
    }

    return {
      ...result,
      feedback,
    };
  } catch (error) {
    console.error('Error completing quiz:', error);
    throw new Error('Failed to complete quiz');
  }
}