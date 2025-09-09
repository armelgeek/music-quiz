import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/features/quiz/domain/service';

const quizService = new QuizService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    const leaderboard = await quizService.getLeaderboard(categoryId, limit);
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}