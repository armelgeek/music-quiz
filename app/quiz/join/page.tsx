'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinQuizPage() {
  const [sessionCode, setSessionCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim() || !participantName.trim()) {
      toast.error('Please enter both session code and your name');
      return;
    }

    if (sessionCode.length !== 6) {
      toast.error('Session code must be 6 digits');
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch('/api/v1/quiz/host/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionCode: sessionCode.trim(),
          participantName: participantName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join session');
      }

      // Successfully joined session
      toast.success(data.rejoined ? 'Rejoined session!' : 'Joined session successfully!');
      
      // TODO: Navigate to hosted quiz participant interface
      // For now, show success message
      toast.info('Participant interface coming soon!');
      
    } catch (error) {
      console.error('Error joining session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to join session: ${errorMessage}`);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full mb-4">
            <Users size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Quiz Session</h1>
          <p className="text-gray-600">Enter the session code provided by your host</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Enter Session Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionCode">Session Code</Label>
                <Input
                  id="sessionCode"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500">Ask your quiz host for the 6-digit session code</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="participantName">Your Name</Label>
                <Input
                  id="participantName"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-gray-500">This is how others will see you in the quiz</p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isJoining || sessionCode.length !== 6 || !participantName.trim()}
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    Join Quiz
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don't have a session code?{' '}
            <button 
              onClick={() => router.push('/quiz')}
              className="text-blue-500 hover:text-blue-600 underline"
            >
              Play solo instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}