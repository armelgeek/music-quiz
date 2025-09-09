import React from 'react';
import { QuizProgress } from '../atoms/quiz-progress';
import { QuizTimer } from '../atoms/quiz-timer';

interface QuizHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  timeRemaining: number;
  totalTime: number;
  categoryName?: string;
  className?: string;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  score,
  timeRemaining,
  totalTime,
  categoryName,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {categoryName && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{categoryName} Quiz</h1>
        </div>
      )}
      
      <QuizProgress
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        score={score}
      />
      
      <QuizTimer
        timeRemaining={timeRemaining}
        totalTime={totalTime}
      />
    </div>
  );
};