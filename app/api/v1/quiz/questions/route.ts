import { NextRequest, NextResponse } from 'next/server';
import { MockQuizService } from '@/features/quiz/domain/mock-service';

const quizService = new MockQuizService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    // Get all questions (not limited like for quiz play)
    const questions = await quizService.getAllQuestions(categoryId || undefined);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const questionData = await request.json();
    
    // Validate required fields
    if (!questionData.question || !questionData.correctAnswer) {
      return NextResponse.json(
        { error: 'Question and correct answer are required' },
        { status: 400 }
      );
    }
    
    const newQuestion = await quizService.createQuestion(questionData);
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}