'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useHostSocket } from '@/shared/hooks/use-host-socket';

export default function TestSocketPage() {
  const [sessionCode, setSessionCode] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [testSession, setTestSession] = useState<{ sessionCode: string; sessionName: string } | null>(null);

  const {
    socket,
    isConnected,
    participants,
    startSession,
    endSession,
  } = useHostSocket(testSession?.sessionCode);

  const createTestSession = async () => {
    try {
      const response = await fetch('/api/test/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionName: sessionName || 'Test Socket Session',
          maxParticipants: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const session = await response.json();
      setTestSession({
        sessionCode: session.sessionCode,
        sessionName: session.sessionName,
      });

      toast.success(`Test session created! Code: ${session.sessionCode}`);
    } catch (error) {
      console.error('Error creating test session:', error);
      toast.error('Failed to create test session');
    }
  };

  const handleStartSession = () => {
    if (testSession) {
      startSession(testSession);
      toast.success('Session started!');
    }
  };

  const handleEndSession = () => {
    if (testSession) {
      endSession(testSession.sessionCode);
      setTestSession(null);
      toast.success('Session ended!');
    }
  };

  if (!testSession) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Socket Test - Create Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionName">Session Name</Label>
                <Input
                  id="sessionName"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Test Socket Session"
                />
              </div>
              <Button onClick={createTestSession} className="w-full">
                Create Test Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Host Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Host Control Panel</CardTitle>
            <p className="text-sm text-gray-600">
              Session: {testSession.sessionName} | Code: {testSession.sessionCode}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>

              <div>
                <h3 className="font-medium mb-2">Participants ({participants.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {participants.length === 0 ? (
                    <p className="text-gray-500 text-sm">No participants yet</p>
                  ) : (
                    participants.map((participant) => (
                      <div 
                        key={participant.participantId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${participant.isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>{participant.participantName}</span>
                        </div>
                        <span>{participant.score} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleStartSession} size="sm">
                  Start Session
                </Button>
                <Button onClick={handleEndSession} variant="destructive" size="sm">
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">How to Test:</h3>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Copy the session code: <strong>{testSession.sessionCode}</strong></li>
                  <li>Open <a href="/join-quiz" target="_blank" className="text-blue-600 underline">/join-quiz</a> in another tab</li>
                  <li>Enter the session code and your name</li>
                  <li>Watch participants appear in real-time on the left</li>
                  <li>Test starting/ending sessions</li>
                </ol>
              </div>

              <div className="p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-900 mb-1">Session Code:</h4>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded border text-lg font-mono">
                    {testSession.sessionCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(testSession.sessionCode);
                      toast.success('Session code copied!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <p><strong>Socket Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
                <p><strong>Participant Count:</strong> {participants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}