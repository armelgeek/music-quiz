import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { startQuizUseCase } from '@/features/quiz/domain/use-cases/start-quiz.use-case';
import { quizSessionSchema } from '@/features/quiz/config/quiz.schema';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = quizSessionSchema.parse(body);

    const result = await startQuizUseCase({
      userId: session.user.id,
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