'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HostControlPanel from '@/features/quiz/components/organisms/host-control-panel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Sample questions for testing
const sampleQuestions = [
  {
    id: '1',
    question: 'Which artist sang "Bohemian Rhapsody"?',
    options: ['The Beatles', 'Queen', 'Led Zeppelin', 'The Rolling Stones'],
    correctAnswer: 'Queen',
    explanation: 'Bohemian Rhapsody was written by Freddie Mercury and performed by Queen in 1975.',
    timeLimit: 30,
    points: 10
  },
  {
    id: '2', 
    question: 'What year was "Thriller" by Michael Jackson released?',
    options: ['1980', '1982', '1983', '1985'],
    correctAnswer: '1982',
    explanation: 'Thriller was released on November 30, 1982 and became the best-selling album of all time.',
    timeLimit: 25,
    points: 10
  },
  {
    id: '3',
    question: 'Which band recorded the album "Dark Side of the Moon"?',
    options: ['Pink Floyd', 'The Who', 'Deep Purple', 'Black Sabbath'],
    correctAnswer: 'Pink Floyd',
    explanation: 'Dark Side of the Moon was released by Pink Floyd in 1973.',
    timeLimit: 30,
    points: 10
  }
];

export default function HostSessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<{
    sessionCode: string;
    sessionName: string;
  } | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    
    const sessionCode = searchParams.get('sessionCode');
    const sessionName = searchParams.get('sessionName');
    
    if (sessionCode && sessionName) {
      setSessionData({ sessionCode, sessionName });
    } else {
      // Redirect to host dashboard if no session data
      router.push('/quiz-host');
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
          onClick={() => router.push('/quiz-host')}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">Host Control Panel</h1>
          <p className="text-gray-600">Manage your live quiz session</p>
        </div>
      </div>
      
      <HostControlPanel
        sessionCode={sessionData.sessionCode}
        sessionName={sessionData.sessionName}
        questions={sampleQuestions}
      />
    </div>
  );
}