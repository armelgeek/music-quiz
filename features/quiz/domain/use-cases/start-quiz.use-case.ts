import { QuizService } from '../service';

const quizService = new QuizService();

export interface StartQuizParams {
  userId: string;
  categoryId?: string;
  totalQuestions?: number;
}

export interface StartQuizResult {
  sessionId: string;
  questions: any[];
  categoryName?: string;
}

export async function startQuizUseCase({
  userId,
  categoryId,
  totalQuestions = 10
}: StartQuizParams): Promise<StartQuizResult> {
  try {
    // Create quiz session
    const session = await quizService.createQuizSession(userId, categoryId, totalQuestions);
    
    // Get questions for the quiz
    const questions = await quizService.getQuizQuestions(categoryId, totalQuestions);
    
    if (questions.length === 0) {
      throw new Error('No questions available for this category');
    }

    // Get category name if provided
    let categoryName;
    if (categoryId) {
      const categories = await quizService.getCategories();
      const category = categories.find(cat => cat.id === categoryId);
      categoryName = category?.name;
    }

    return {
      sessionId: session.id,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        audioUrl: q.audioUrl,
        options: q.options,
        timeLimit: q.timeLimit,
        points: q.points,
        // Don't include correct answer in the response
      })),
      categoryName,
    };
  } catch (error) {
    console.error('Error starting quiz:', error);
    throw new Error('Failed to start quiz');
  }
}