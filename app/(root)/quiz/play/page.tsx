'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizGame } from '@/features/quiz/components/organisms/quiz-game';
import { QuizResult } from '@/features/quiz/config/quiz.types';

function QuizPlayContent() {
  const [quizData, setQuizData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get('session');

  useEffect(() => {
    if (!sessionId) {
      router.push('/quiz');
      return;
    }

    // In a real implementation, you'd fetch the quiz session data
    // For now, we'll simulate having the data
    setIsLoading(false);
  }, [sessionId, router]);

  const handleAnswerSubmit = async (
    sessionId: string,
    questionId: string,
    answer: string,
    timeSpent: number
  ) => {
    try {
      const response = await fetch('/api/v1/quiz/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          questionId,
          userAnswer: answer,
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  const handleQuizComplete = async (sessionId: string): Promise<QuizResult> => {
    try {
      const response = await fetch('/api/v1/quiz/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    }
  };

  const handlePlayAgain = () => {
    router.push('/quiz');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleGoHome}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // For demo purposes, let's create some sample questions
  const sampleQuestions = [
    {
      id: '1',
      type: 'multiple_choice' as const,
      question: 'Which artist released the album "Thriller" in 1982?',
      options: ['Michael Jackson', 'Prince', 'Madonna', 'Whitney Houston'],
      timeLimit: 30,
      points: 10,
    },
    {
      id: '2',
      type: 'true_false' as const,
      question: 'The Beatles were formed in Liverpool, England.',
      timeLimit: 20,
      points: 10,
    },
    {
      id: '3',
      type: 'multiple_choice' as const,
      question: 'What year was "Bohemian Rhapsody" by Queen released?',
      options: ['1975', '1976', '1977', '1978'],
      timeLimit: 30,
      points: 10,
    },
    {
      id: '4',
      type: 'multiple_choice' as const,
      question: 'Which instrument is Jimi Hendrix most famous for playing?',
      options: ['Piano', 'Guitar', 'Drums', 'Bass'],
      timeLimit: 25,
      points: 10,
    },
    {
      id: '5',
      type: 'true_false' as const,
      question: 'Elvis Presley was born in Memphis, Tennessee.',
      timeLimit: 20,
      points: 10,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {sessionId && (
          <QuizGame
            sessionId={sessionId}
            questions={sampleQuestions}
            categoryName="Music Knowledge"
            onAnswerSubmit={handleAnswerSubmit}
            onQuizComplete={handleQuizComplete}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
          />
        )}
      </div>
    </div>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <QuizPlayContent />
    </Suspense>
  );
}