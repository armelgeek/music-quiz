import { NextRequest, NextResponse } from 'next/server';
// For demo purposes, we'll skip auth requirements
import { submitAnswerUseCase } from '@/features/quiz/domain/use-cases/submit-answer.use-case';
import { quizAnswerSchema } from '@/features/quiz/config/quiz.schema';

export async function POST(request: NextRequest) {
  try {
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