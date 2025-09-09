'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ParticipantView from '@/features/quiz/components/organisms/participant-view';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ParticipantSessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<{
    sessionCode: string;
    participantName: string;
    participantId: string;
  } | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    
    const sessionCode = searchParams.get('sessionCode');
    const participantName = searchParams.get('participantName');
    const participantId = searchParams.get('participantId');
    
    if (sessionCode && participantName && participantId) {
      setSessionData({ sessionCode, participantName, participantId });
    } else {
      // Redirect to join page if no session data
      router.push('/quiz/join');
    }
  }, [searchParams, router]);

  if (!sessionData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/quiz/join')}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Leave Session
        </Button>
      </div>
      
      <ParticipantView
        sessionCode={sessionData.sessionCode}
        participantName={sessionData.participantName}
        participantId={sessionData.participantId}
      />
    </div>
  );
}