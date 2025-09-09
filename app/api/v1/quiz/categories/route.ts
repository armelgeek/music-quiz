import { NextRequest, NextResponse } from 'next/server';
import { MockQuizService } from '@/features/quiz/domain/mock-service';

const quizService = new MockQuizService();

export async function GET(request: NextRequest) {
  try {
    const categories = await quizService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}