import React from 'react';
import { Trophy, Share2, RotateCcw, Home } from 'lucide-react';
import { QuizResult } from '../../config/quiz.types';

interface QuizResultsProps {
  result: QuizResult;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onShare?: () => void;
  className?: string;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  onPlayAgain,
  onGoHome,
  onShare,
  className = ''
}) => {
  const { totalScore, totalQuestions, correctAnswers, accuracy, timeSpent, feedback, rank } = result;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-blue-600';
    if (accuracy >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return '🎉 Outstanding performance!';
    if (accuracy >= 80) return '🎵 Great job!';
    if (accuracy >= 70) return '👍 Well done!';
    if (accuracy >= 60) return '📈 Good effort!';
    if (accuracy >= 50) return '💪 Keep practicing!';
    return '🎯 Room for improvement!';
  };

  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(timeSpent / totalQuestions) : 0;

  return (
    <div className={`bg-white rounded-lg p-8 shadow-lg border text-center max-w-lg mx-auto ${className}`}>
      <div className="mb-6">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
        <p className="text-gray-600">{getPerformanceMessage()}</p>
        <p className="text-sm text-gray-500 mt-1">{feedback}</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
            {totalScore}
          </div>
          <div className="text-sm text-gray-600">Total Score</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
            <div className="text-xs text-gray-600">Wrong</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-lg font-bold text-gray-800">{formatTime(timeSpent)}</div>
            <div className="text-xs text-gray-600">Total Time</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-lg font-bold text-gray-800">{avgTimePerQuestion}s</div>
            <div className="text-xs text-gray-600">Avg/Question</div>
          </div>
        </div>

        {rank && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">#{rank}</div>
            <div className="text-sm text-gray-600">Your Rank</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RotateCcw size={16} />
            Play Again
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
          )}
        </div>
        
        <button
          onClick={onGoHome}
          className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Home size={16} />
          Back to Home
        </button>
      </div>
    </div>
  );
};