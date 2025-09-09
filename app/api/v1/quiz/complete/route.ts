import { NextRequest, NextResponse } from 'next/server';
// For demo purposes, we'll skip auth requirements
import { completeQuizUseCase } from '@/features/quiz/domain/use-cases/complete-quiz.use-case';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const result = await completeQuizUseCase({ sessionId });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error completing quiz:', error);
    return NextResponse.json(
      { error: 'Failed to complete quiz' },
      { status: 500 }
    );
  }
}