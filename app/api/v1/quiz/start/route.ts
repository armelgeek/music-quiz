import { NextRequest, NextResponse } from 'next/server';
// For demo purposes, we'll skip auth requirements
import { startQuizUseCase } from '@/features/quiz/domain/use-cases/start-quiz.use-case';
import { quizSessionSchema } from '@/features/quiz/config/quiz.schema';

export async function POST(request: NextRequest) {
  try {
    // For demo, we'll use a mock user ID
    const mockUserId = 'demo-user-' + Date.now();

    const body = await request.json();
    const validatedData = quizSessionSchema.parse(body);

    const result = await startQuizUseCase({
      userId: mockUserId,
      categoryId: validatedData.categoryId,
      totalQuestions: validatedData.totalQuestions,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error starting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz' },
      { status: 500 }
    );
  }
}