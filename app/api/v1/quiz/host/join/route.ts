import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { db } from '@/drizzle/db';
import { quizHostSessions, quizHostParticipants } from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

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

    // Find the host session
    const [hostSession] = await db
      .select()
      .from(quizHostSessions)
      .where(and(
        eq(quizHostSessions.sessionCode, sessionCode),
        eq(quizHostSessions.isActive, true)
      ));

    if (!hostSession) {
      return NextResponse.json(
        { error: 'Invalid session code or session has ended' },
        { status: 404 }
      );
    }

    // Check if session has room for more participants
    const participantCount = await db
      .select({ count: sql`count(*)` })
      .from(quizHostParticipants)
      .where(eq(quizHostParticipants.hostSessionId, hostSession.id));

    if (participantCount[0]?.count >= hostSession.maxParticipants) {
      return NextResponse.json(
        { error: 'Session is full' },
        { status: 400 }
      );
    }

    // Get user ID if authenticated (optional for participants)
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id || null;

    // Check if user/name already joined this session
    const existingParticipant = await db
      .select()
      .from(quizHostParticipants)
      .where(and(
        eq(quizHostParticipants.hostSessionId, hostSession.id),
        userId 
          ? eq(quizHostParticipants.userId, userId)
          : eq(quizHostParticipants.participantName, participantName)
      ));

    if (existingParticipant.length > 0) {
      // Rejoin existing participant
      const [participant] = await db
        .update(quizHostParticipants)
        .set({
          isConnected: true,
          participantName, // Update name in case it changed
        })
        .where(eq(quizHostParticipants.id, existingParticipant[0].id))
        .returning();

      return NextResponse.json({
        participantId: participant.id,
        sessionName: hostSession.sessionName,
        currentScore: participant.currentScore,
        rejoined: true,
      });
    }

    // Create new participant
    const [participant] = await db
      .insert(quizHostParticipants)
      .values({
        hostSessionId: hostSession.id,
        userId,
        participantName,
        currentScore: 0,
        isConnected: true,
      })
      .returning();

    return NextResponse.json({
      participantId: participant.id,
      sessionName: hostSession.sessionName,
      currentScore: 0,
      rejoined: false,
    }, { status: 201 });

  } catch (error) {
    console.error('Error joining host session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}