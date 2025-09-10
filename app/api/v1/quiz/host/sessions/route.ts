import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { db } from '@/drizzle/db';
import { quizHostSessions, quizHostParticipants, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Check authentication and host role
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has host role
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    /**if (!user || (user.role !== 'host' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Host permissions required' },
        { status: 403 }
      );
    }**/

    // Fetch host sessions for the current user
    const hostSessions = await db
      .select({
        id: quizHostSessions.id,
        sessionName: quizHostSessions.sessionName,
        sessionCode: quizHostSessions.sessionCode,
        maxParticipants: quizHostSessions.maxParticipants,
        isActive: quizHostSessions.isActive,
        createdAt: quizHostSessions.createdAt,
        startedAt: quizHostSessions.startedAt,
        endedAt: quizHostSessions.endedAt,
      })
      .from(quizHostSessions)
      .where(eq(quizHostSessions.hostUserId, session.user.id))
      .orderBy(quizHostSessions.createdAt);

    // Fetch participant counts for each session
    const sessionsWithParticipants = await Promise.all(
      hostSessions.map(async (hostSession) => {
        const participants = await db
          .select()
          .from(quizHostParticipants)
          .where(eq(quizHostParticipants.hostSessionId, hostSession.id));

        return {
          ...hostSession,
          participantCount: participants.length,
          participants: participants.map(p => ({
            id: p.id,
            participantName: p.participantName,
            currentScore: p.currentScore,
            isConnected: p.isConnected,
            joinedAt: p.joinedAt,
          })),
        };
      })
    );

    return NextResponse.json(sessionsWithParticipants);

  } catch (error) {
    console.error('Error fetching host sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch host sessions' },
      { status: 500 }
    );
  }
}