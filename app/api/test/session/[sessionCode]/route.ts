import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionCode: string }> }
) {
  try {
    const { sessionCode } = await params;

    // For testing - return a mock session
    const mockSession = {
      id: `test-session-${sessionCode}`,
      sessionName: `Test Session ${sessionCode}`,
      sessionCode,
      maxParticipants: 10,
      isActive: true,
      createdAt: new Date().toISOString(),
      startedAt: null,
    };

    return NextResponse.json(mockSession);

  } catch (error) {
    console.error('Error fetching test session info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test session info' },
      { status: 500 }
    );
  }
}