import React from 'react';

interface QuizTimerProps {
  timeRemaining: number;
  totalTime: number;
  className?: string;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ 
  timeRemaining, 
  totalTime, 
  className = '' 
}) => {
  const percentage = (timeRemaining / totalTime) * 100;
  const isLowTime = timeRemaining <= 10;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isLowTime ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`font-bold text-lg ${
        isLowTime ? 'text-red-500 animate-pulse' : 'text-gray-700'
      }`}>
        {timeRemaining}s
      </span>
    </div>
  );
};