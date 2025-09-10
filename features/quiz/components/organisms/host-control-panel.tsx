'use client';

import React, { useState, useEffect } from 'react';
import { useHostSocket } from '@/shared/hooks/use-host-socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, StopCircle, Users, Trophy, Clock, Check, X, MessageSquare } from 'lucide-react';

interface HostControlPanelProps {
  sessionCode: string;
  sessionName: string;
  questions: any[];
}

export default function HostControlPanel({ 
  sessionCode, 
  sessionName, 
  questions 
}: HostControlPanelProps) {
  const {
    socket,
    isConnected,
    participants,
    startSession,
    endSession,
    nextQuestion,
    showResults,
    showLeaderboard,
    clearParticipantAnswers,
    updateAnswerCorrectness,
  } = useHostSocket(sessionCode);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStatus, setSessionStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Handle session start
  const handleStartSession = () => {
    startSession({ sessionCode, sessionName });
    setSessionStatus('active');
    
    // Clear any previous answer states
    clearParticipantAnswers();
    
    // Start with first question
    if (currentQuestion) {
      nextQuestion({
        sessionCode,
        question: currentQuestion,
        timeLimit: currentQuestion.timeLimit || 30
      });
      setTimeLeft(currentQuestion.timeLimit || 30);
      startTimer();
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
      const question = questions[nextQuestionIndex];
      
      // Clear participant answers for the new question
      clearParticipantAnswers();
      
      nextQuestion({
        sessionCode,
        question,
        timeLimit: question.timeLimit || 30
      });
      
      setTimeLeft(question.timeLimit || 30);
      startTimer();
    }
  };

  // Handle show results
  const handleShowResults = () => {
    if (currentQuestion) {
      // Update participant answer correctness
      updateAnswerCorrectness(currentQuestion.correctAnswer);
      
      showResults({
        sessionCode,
        results: {
          correct_answer: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation
        }
      });
    }
    
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  // Handle show leaderboard  
  const handleShowLeaderboard = () => {
    // Calculate scores based on participants
    const leaderboardData = participants
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        participantId: p.participantId,
        participantName: p.participantName,
        score: p.score
      }));

    showLeaderboard({
      sessionCode,
      leaderboard: leaderboardData
    });
  };

  // Handle end session
  const handleEndSession = () => {
    endSession(sessionCode);
    setSessionStatus('ended');
    
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  // Timer functions
  const startTimer = () => {
    if (timer) clearInterval(timer);
    
    const newTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(newTimer);
          handleShowResults(); // Auto-show results when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

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
    <div className="space-y-6">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{sessionName}</h2>
              <p className="text-sm text-gray-500">Session Code: {sessionCode}</p>
            </div>
            <Badge variant={sessionStatus === 'active' ? 'default' : 'secondary'}>
              {sessionStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{participants.length} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>Current Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg">{currentQuestion.question}</p>
              
              {currentQuestion.options && (
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      {String.fromCharCode(65 + index)}. {option}
                    </div>
                  ))}
                </div>
              )}
              
              {sessionStatus === 'active' && timeLeft > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {timeLeft}s
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(timeLeft / (currentQuestion.timeLimit || 30)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Session Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {sessionStatus === 'waiting' && (
              <Button onClick={handleStartSession} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Session
              </Button>
            )}
            
            {sessionStatus === 'active' && (
              <>
                <Button onClick={handleShowResults} variant="outline" className="flex items-center gap-2">
                  Show Results
                </Button>
                
                <Button onClick={handleShowLeaderboard} variant="outline" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Show Leaderboard
                </Button>
                
                {currentQuestionIndex < questions.length - 1 && (
                  <Button onClick={handleNextQuestion} className="flex items-center gap-2">
                    Next Question
                  </Button>
                )}
                
                <Button onClick={handleEndSession} variant="destructive" className="flex items-center gap-2">
                  <StopCircle className="h-4 w-4" />
                  End Session
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle>Participants ({participants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {participants.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No participants yet</p>
            ) : (
              participants.map((participant) => (
                <div 
                  key={participant.participantId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        participant.isConnected ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></div>
                    <div className="flex flex-col">
                      <span className="font-medium">{participant.participantName}</span>
                      {participant.hasAnswered && (
                        <div className="flex items-center gap-2 mt-1">
                          <MessageSquare className="h-3 w-3 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            Answer: <span className="font-medium">{participant.currentAnswer}</span>
                          </span>
                          {participant.isCorrect !== undefined && (
                            participant.isCorrect ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )
                          )}
                        </div>
                      )}
                      {!participant.hasAnswered && sessionStatus === 'active' && (
                        <span className="text-xs text-gray-400 mt-1">Waiting for answer...</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.hasAnswered && (
                      <Badge 
                        variant={participant.isCorrect === true ? 'default' : participant.isCorrect === false ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {participant.hasAnswered ? 'Answered' : 'Waiting'}
                      </Badge>
                    )}
                    <Badge variant="outline">{participant.score} pts</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}