import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { quizHostSessions } from '@/drizzle/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionName, maxParticipants = 50 } = body;

    if (!sessionName) {
      return NextResponse.json(
        { error: 'Session name is required' },
        { status: 400 }
      );
    }

    // Generate a unique 6-digit session code
    const generateSessionCode = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const sessionCode = generateSessionCode();

    // For testing - create a mock session without authentication
    const mockHostSession = {
      id: `test-${Date.now()}`,
      sessionName,
      sessionCode,
      maxParticipants,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(mockHostSession, { status: 201 });

  } catch (error) {
    console.error('Error creating test session:', error);
    return NextResponse.json(
      { error: 'Failed to create test session' },
      { status: 500 }
    );
  }
}