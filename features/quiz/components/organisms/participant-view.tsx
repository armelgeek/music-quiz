'use client';

import React, { useState } from 'react';
import { useParticipantSocket } from '@/shared/hooks/use-host-socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ParticipantViewProps {
  sessionCode: string;
  participantName: string;
  participantId: string;
  onLeaveSession?: () => void;
}

export default function ParticipantView({ 
  sessionCode, 
  participantName, 
  participantId,
  onLeaveSession 
}: ParticipantViewProps) {
  const {
    socket,
    isConnected,
    currentQuestion,
    sessionStatus,
    leaderboard,
    results,
    joinAsParticipant,
    submitAnswer,
    leaveSession,
  } = useParticipantSocket(sessionCode);

  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerTime, setAnswerTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Handle leaving session with proper notification
  const handleLeaveSession = () => {
    // Emit leave event to notify server and other participants
    leaveSession(participantName, participantId);
    
    // Call the parent's leave handler if provided
    if (onLeaveSession) {
      onLeaveSession();
    } else {
      // Fallback to direct navigation
      router.push('/quiz/join');
    }
  };

  // Enhanced countdown timer that updates every second
  useEffect(() => {
    if (!currentQuestion?.startTime || !currentQuestion?.timeLimit || hasAnswered) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = (Date.now() - currentQuestion.startTime) / 1000;
      const remaining = Math.max(0, currentQuestion.timeLimit - elapsed);
      const timeLeft = Math.ceil(remaining);
      setTimeRemaining(timeLeft);
      
      // Auto-submit when time runs out
      if (timeLeft <= 0 && !hasAnswered) {
        handleAnswerSubmit(''); // Submit empty answer
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, hasAnswered]);

  // Join session when component mounts
  React.useEffect(() => {
    if (isConnected && sessionCode && participantName) {
      joinAsParticipant(participantName, participantId);
    }
  }, [isConnected, sessionCode, participantName, participantId, joinAsParticipant]);

  // Reset answer state when new question arrives
  React.useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer('');
      setHasAnswered(false);
      setAnswerTime(null);
    }
  }, [currentQuestion]);

  const handleAnswerSubmit = (answer: string) => {
    if (hasAnswered || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    setAnswerTime(Date.now());
    
    submitAnswer(answer, currentQuestion.question.id, participantId);
  };

  const getTimeRemaining = () => {
    return timeRemaining;
  };

  const myPosition = leaderboard.findIndex(p => p.participantId === participantId) + 1;
  const myScore = leaderboard.find(p => p.participantId === participantId)?.score || 0;

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Connecting to session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Quiz Session</h2>
              <p className="text-sm text-gray-500">Code: {sessionCode}</p>
            </div>
            <Badge variant={sessionStatus === 'active' ? 'default' : 'secondary'}>
              {sessionStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{participantName}</p>
              <p className="text-sm text-gray-500">
                {myPosition ? `#${myPosition}` : 'Not ranked'} • {myScore} points
              </p>
            </div>
            <div className="flex items-center gap-4">
              {sessionStatus === 'active' && (
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{getTimeRemaining()}s remaining</span>
                  </div>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLeaveSession}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Leave
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waiting for session */}
      {sessionStatus === 'waiting' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Waiting for host...</h3>
              <p className="text-gray-500">The session will start soon!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      {sessionStatus === 'active' && currentQuestion && !results && (
        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Countdown Timer */}
              {timeRemaining > 0 && currentQuestion?.timeLimit && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className={`text-3xl font-bold mb-2 ${timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                    {timeRemaining}s
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        timeRemaining <= 10 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${(timeRemaining / (currentQuestion.timeLimit || 30)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Time remaining to answer</p>
                </div>
              )}
              
              <p className="text-lg font-medium">{currentQuestion.question.question}</p>
              
              {currentQuestion.question.options && (
                <div className="space-y-2">
                  {currentQuestion.question.options.map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === option ? 'default' : 'outline'}
                      className="w-full text-left justify-start p-4 h-auto"
                      onClick={() => handleAnswerSubmit(option)}
                      disabled={hasAnswered}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm bg-gray-100 px-2 py-1 rounded">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
              
              {hasAnswered && (
                <div className="text-center p-4 bg-green-50 rounded">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 font-semibold">Answer submitted!</p>
                  <p className="text-sm text-green-600">Waiting for other participants...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                {selectedAnswer === results.correct_answer ? (
                  <div className="text-green-600">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Correct!</h3>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <XCircle className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Incorrect</h3>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Correct answer:</p>
                <p className="font-semibold text-lg">{results.correct_answer}</p>
              </div>
              
              {results.explanation && (
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700">{results.explanation}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((participant, index) => (
                <div 
                  key={participant.participantId}
                  className={`flex items-center justify-between p-3 rounded ${
                    participant.participantId === participantId 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-yellow-500 text-white' : 
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-200 text-gray-600'}
                    `}>
                      {index + 1}
                    </div>
                    <span className={`
                      ${participant.participantId === participantId ? 'font-bold' : ''}
                    `}>
                      {participant.participantName}
                    </span>
                  </div>
                  <Badge variant="outline">{participant.score} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Ended */}
      {sessionStatus === 'ended' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Quiz Completed!</h3>
              <p className="text-gray-600 mb-4">
                Final Position: #{myPosition} with {myScore} points
              </p>
              <p className="text-sm text-gray-500">
                Thanks for playing!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}