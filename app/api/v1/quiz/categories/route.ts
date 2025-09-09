import { NextResponse } from 'next/server';
import { QuizService } from '@/features/quiz/domain/service';

const quizService = new QuizService();

export async function GET() {
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