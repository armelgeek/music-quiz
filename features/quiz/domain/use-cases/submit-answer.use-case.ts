import { QuizService } from '../service';

const quizService = new QuizService();

export interface SubmitAnswerParams {
  sessionId: string;
  questionId: string;
  userAnswer: string;
  timeSpent: number;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  pointsEarned: number;
  explanation?: string;
  artistInfo?: any;
  feedback: string;
}

export async function submitAnswerUseCase({
  sessionId,
  questionId,
  userAnswer,
  timeSpent
}: SubmitAnswerParams): Promise<SubmitAnswerResult> {
  try {
    const result = await quizService.submitAnswer(
      sessionId,
      questionId,
      userAnswer,
      timeSpent
    );

    let feedback = '';
    if (result.isCorrect) {
      feedback = 'Correct! Well done! 🎉';
    } else {
      feedback = `Not quite right. The correct answer was: ${result.correctAnswer}`;
    }

    return {
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      pointsEarned: result.pointsEarned,
      explanation: result.explanation || undefined,
      artistInfo: result.artistInfo,
      feedback,
    };
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw new Error('Failed to submit answer');
  }
}