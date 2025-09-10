import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionCode, participantName } = body;

    if (!sessionCode || !participantName) {
      return NextResponse.json(
        { error: 'Session code and participant name are required' },
        { status: 400 }
      );
    }

    // For testing - create a mock participant without database
    const mockParticipant = {
      participantId: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionName: `Test Session for ${sessionCode}`,
      currentScore: 0,
      rejoined: false,
    };

    return NextResponse.json(mockParticipant, { status: 201 });

  } catch (error) {
    console.error('Error joining test session:', error);
    return NextResponse.json(
      { error: 'Failed to join test session' },
      { status: 500 }
    );
  }
}