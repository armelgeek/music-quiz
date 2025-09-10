import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { db } from '@/drizzle/db';
import { quizHostSessions, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { sessionName, categoryId, maxParticipants = 50, questions } = body;

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

    let sessionCode = generateSessionCode();
    let attempts = 0;
    
    // Ensure session code is unique
    while (attempts < 10) {
      const existingSession = await db
        .select()
        .from(quizHostSessions)
        .where(eq(quizHostSessions.sessionCode, sessionCode))
        .limit(1);

      if (existingSession.length === 0) break;
      
      sessionCode = generateSessionCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Unable to generate unique session code' },
        { status: 500 }
      );
    }

    // Create host session
    const [hostSession] = await db
      .insert(quizHostSessions)
      .values({
        hostUserId: session.user.id,
        categoryId,
        sessionName,
        sessionCode,
        maxParticipants,
        questions: questions || null,
        settings: {
          autoAdvance: true,
          showLeaderboard: true,
          allowLateJoins: true,
        },
      })
      .returning();

    return NextResponse.json({
      id: hostSession.id,
      sessionName: hostSession.sessionName,
      sessionCode: hostSession.sessionCode,
      maxParticipants: hostSession.maxParticipants,
      createdAt: hostSession.createdAt,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating host session:', error);
    return NextResponse.json(
      { error: 'Failed to create host session' },
      { status: 500 }
    );
  }
}