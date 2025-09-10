'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useParticipantSocket } from '@/shared/hooks/use-host-socket';

export default function JoinQuizPage() {
  const router = useRouter();
  const [sessionCode, setSessionCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinedSession, setJoinedSession] = useState<{
    sessionCode: string;
    sessionName: string;
    participantId: string;
  } | null>(null);

  const {
    socket,
    isConnected,
    currentQuestion,
    sessionStatus,
    leaderboard,
    results,
    joinAsParticipant,
    submitAnswer,
  } = useParticipantSocket(joinedSession?.sessionCode);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode || !participantName) {
      toast.error('Please enter both session code and your name');
      return;
    }

    setIsJoining(true);

    try {
      // First, check if session exists
      let sessionResponse = await fetch(`/api/v1/quiz/session/${sessionCode}`);
      
      // If the main API fails, try the test API
      if (!sessionResponse.ok) {
        sessionResponse = await fetch(`/api/test/session/${sessionCode}`);
      }
      
      if (!sessionResponse.ok) {
        throw new Error('Session not found');
      }

      const sessionData = await sessionResponse.json();

      // Join the session
      let joinResponse = await fetch('/api/v1/quiz/host/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionCode,
          participantName,
        }),
      });

      // If the main API fails, try the test API
      if (!joinResponse.ok) {
        joinResponse = await fetch('/api/test/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionCode,
            participantName,
          }),
        });
      }

      if (!joinResponse.ok) {
        const errorData = await joinResponse.json();
        throw new Error(errorData.error || 'Failed to join session');
      }

      const participantData = await joinResponse.json();

      setJoinedSession({
        sessionCode,
        sessionName: sessionData.sessionName,
        participantId: participantData.participantId,
      });

      // Join via socket
      setTimeout(() => {
        joinAsParticipant(participantName, participantData.participantId);
      }, 1000);

      toast.success(`Joined ${sessionData.sessionName}!`);
    } catch (error) {
      console.error('Error joining session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to join session: ${errorMessage}`);
    } finally {
      setIsJoining(false);
    }
  };

  if (joinedSession) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Session: {joinedSession.sessionName}</CardTitle>
            <p className="text-sm text-gray-600">
              Session Code: {joinedSession.sessionCode} | 
              Status: {sessionStatus} | 
              Connected: {isConnected ? '✅' : '❌'}
            </p>
          </CardHeader>
          <CardContent>
            {sessionStatus === 'waiting' && (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <h3 className="text-xl font-medium mb-2">Waiting for quiz to start...</h3>
                  <p className="text-gray-600">The host will start the quiz soon!</p>
                </div>
              </div>
            )}

            {currentQuestion && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Current Question:</h3>
                <p className="text-xl">{currentQuestion.question.question}</p>
                
                {currentQuestion.question.options && (
                  <div className="grid grid-cols-1 gap-2">
                    {currentQuestion.question.options.map((option: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="p-4 text-left justify-start"
                        onClick={() => {
                          submitAnswer(option, currentQuestion.question.id, joinedSession.participantId);
                          toast.success('Answer submitted!');
                        }}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {results && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium">Correct Answer:</h3>
                <p>{results.correct_answer}</p>
                {results.explanation && (
                  <p className="text-sm text-gray-600 mt-2">{results.explanation}</p>
                )}
              </div>
            )}

            {leaderboard.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Leaderboard:</h3>
                <div className="space-y-2">
                  {leaderboard.map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>#{entry.rank} {entry.participantName}</span>
                      <span>{entry.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Join Quiz Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinSession} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionCode">Session Code</Label>
              <Input
                id="sessionCode"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="participantName">Your Name</Label>
              <Input
                id="participantName"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isJoining}>
              {isJoining ? 'Joining...' : 'Join Session'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}