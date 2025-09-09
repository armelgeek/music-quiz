import { NextRequest, NextResponse } from 'next/server';
import { submitAnswerUseCase } from '@/features/quiz/domain/use-cases/submit-answer.use-case';
import { quizAnswerSchema } from '@/features/quiz/config/quiz.schema';
import { auth } from '@/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - quiz playing requires at least anonymous session
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Allow anonymous users to play but track them
    const userId = session?.user?.id || 'anonymous';
    console.log('User submitting answer:', userId);

    const body = await request.json();
    const validatedData = quizAnswerSchema.parse(body);

    const result = await submitAnswerUseCase({
      sessionId: validatedData.sessionId,
      questionId: validatedData.questionId,
      userAnswer: validatedData.userAnswer,
      timeSpent: validatedData.timeSpent,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}