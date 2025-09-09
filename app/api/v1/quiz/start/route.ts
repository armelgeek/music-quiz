import { NextRequest, NextResponse } from 'next/server';
import { startQuizUseCase } from '@/features/quiz/domain/use-cases/start-quiz.use-case';
import { quizSessionSchema } from '@/features/quiz/config/quiz.schema';
import { auth } from '@/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // For demo, we'll use a mock user ID
   const session = await auth.api.getSession({ headers: await headers() });
   
    const body = await request.json();
    const validatedData = quizSessionSchema.parse(body);

    const result = await startQuizUseCase({
      userId: session?.user.id || 'anonymous',
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