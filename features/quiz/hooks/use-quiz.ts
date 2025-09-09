import { useState, useEffect, useCallback } from 'react';
import { QuizState, QuizAnswerState } from '../config/quiz.types';

interface UseQuizTimerProps {
  totalTime: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function useQuizTimer({ totalTime, onTimeUp, isActive }: UseQuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(totalTime);

  useEffect(() => {
    setTimeRemaining(totalTime);
  }, [totalTime]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const resetTimer = useCallback((newTime: number) => {
    setTimeRemaining(newTime);
  }, []);

  return { timeRemaining, resetTimer };
}

interface UseQuizStateProps {
  totalQuestions: number;
}

export function useQuizState({ totalQuestions }: UseQuizStateProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    totalQuestions,
    score: 0,
    timeRemaining: 0,
    isActive: false,
    answers: [],
  });

  const updateScore = useCallback((points: number) => {
    setQuizState(prev => ({
      ...prev,
      score: prev.score + points,
    }));
  }, []);

  const addAnswer = useCallback((answer: QuizAnswerState) => {
    setQuizState(prev => ({
      ...prev,
      answers: [...prev.answers, answer],
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1,
    }));
  }, []);

  const setActiveState = useCallback((isActive: boolean) => {
    setQuizState(prev => ({
      ...prev,
      isActive,
    }));
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizState({
      currentQuestion: 0,
      totalQuestions,
      score: 0,
      timeRemaining: 0,
      isActive: false,
      answers: [],
    });
  }, [totalQuestions]);

  return {
    quizState,
    updateScore,
    addAnswer,
    nextQuestion,
    setActiveState,
    resetQuiz,
  };
}