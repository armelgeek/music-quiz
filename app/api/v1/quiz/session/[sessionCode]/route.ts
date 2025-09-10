import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { quizHostSessions } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionCode: string } }
) {
  try {
    const { sessionCode } = params;

    if (!sessionCode) {
      return NextResponse.json(
        { error: 'Session code is required' },
        { status: 400 }
      );
    }

    // Find the session
    const [session] = await db
      .select({
        id: quizHostSessions.id,
        sessionName: quizHostSessions.sessionName,
        sessionCode: quizHostSessions.sessionCode,
        maxParticipants: quizHostSessions.maxParticipants,
        isActive: quizHostSessions.isActive,
        createdAt: quizHostSessions.createdAt,
        startedAt: quizHostSessions.startedAt,
      })
      .from(quizHostSessions)
      .where(and(
        eq(quizHostSessions.sessionCode, sessionCode),
        eq(quizHostSessions.isActive, true)
      ));

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);

  } catch (error) {
    console.error('Error fetching session info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session info' },
      { status: 500 }
    );
  }
}