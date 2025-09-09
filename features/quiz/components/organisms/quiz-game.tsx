import React, { useState, useEffect, useCallback } from 'react';
import { QuizHeader } from '../molecules/quiz-header';
import { QuizQuestion } from '../molecules/quiz-question';
import { QuizResults } from '../molecules/quiz-results';
import { useQuizState, useQuizTimer } from '../../hooks/use-quiz';
import { QuizResult } from '../../config/quiz.types';

interface QuizGameProps {
  sessionId: string;
  questions: any[];
  categoryName?: string;
  onQuizComplete: (sessionId: string) => Promise<QuizResult>;
  onAnswerSubmit: (sessionId: string, questionId: string, answer: string, timeSpent: number) => Promise<any>;
  onPlayAgain: () => void;
  onGoHome: () => void;
  className?: string;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  sessionId,
  questions,
  categoryName,
  onQuizComplete,
  onAnswerSubmit,
  onPlayAgain,
  onGoHome,
  className = ''
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const { quizState, updateScore, addAnswer, nextQuestion, setActiveState } = useQuizState({
    totalQuestions: questions.length,
  });

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleTimeUp = useCallback(async () => {
    if (!isAnswered && currentQuestion) {
      await handleAnswer(''); // Submit empty answer when time runs out
    }
  }, [isAnswered, currentQuestion]);

  const { timeRemaining, resetTimer } = useQuizTimer({
    totalTime: currentQuestion?.timeLimit || 30,
    onTimeUp: handleTimeUp,
    isActive: quizState.isActive && !isAnswered,
  });

  useEffect(() => {
    if (currentQuestion) {
      setActiveState(true);
      resetTimer(currentQuestion.timeLimit || 30);
      setQuestionStartTime(Date.now());
      setIsAnswered(false);
      setShowFeedback(false);
      setFeedbackData(null);
    }
  }, [currentQuestion, setActiveState, resetTimer]);

  const handleAnswer = async (answer: string) => {
    if (isAnswered || !currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setIsAnswered(true);
    setActiveState(false);

    try {
      const feedback = await onAnswerSubmit(sessionId, currentQuestion.id, answer, timeSpent);
      setFeedbackData(feedback);
      setShowFeedback(true);

      // Update local state
      updateScore(feedback.pointsEarned);
      addAnswer({
        questionId: currentQuestion.id,
        userAnswer: answer,
        isCorrect: feedback.isCorrect,
        pointsEarned: feedback.pointsEarned,
        timeSpent,
      });

      // Auto-advance after showing feedback
      setTimeout(() => {
        if (isLastQuestion) {
          completeQuiz();
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
          nextQuestion();
        }
      }, 3000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Handle error - maybe show toast
    }
  };

  const completeQuiz = async () => {
    try {
      const result = await onQuizComplete(sessionId);
      setQuizResult(result);
      setActiveState(false);
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  const handleShare = () => {
    if (quizResult) {
      const shareText = `I just scored ${quizResult.totalScore} points with ${quizResult.accuracy}% accuracy in the ${categoryName || 'Music'} Quiz! Can you beat my score?`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Music Quiz Results',
          text: shareText,
          url: window.location.href,
        });
      } else {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareText);
        // Show toast notification
        alert('Results copied to clipboard!');
      }
    }
  };

  if (quizResult) {
    return (
      <QuizResults
        result={quizResult}
        onPlayAgain={onPlayAgain}
        onGoHome={onGoHome}
        onShare={handleShare}
        className={className}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      <QuizHeader
        currentQuestion={currentQuestionIndex}
        totalQuestions={questions.length}
        score={quizState.score}
        timeRemaining={timeRemaining}
        totalTime={currentQuestion.timeLimit || 30}
        categoryName={categoryName}
      />

      <QuizQuestion
        id={currentQuestion.id}
        type={currentQuestion.type}
        question={currentQuestion.question}
        options={currentQuestion.options}
        audioUrl={currentQuestion.audioUrl}
        onAnswer={handleAnswer}
        isAnswered={isAnswered}
        correctAnswer={feedbackData?.correctAnswer}
        userAnswer={feedbackData ? quizState.answers[quizState.answers.length - 1]?.userAnswer : undefined}
      />

      {showFeedback && feedbackData && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className={`text-center ${feedbackData.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            <p className="text-lg font-bold mb-2">{feedbackData.feedback}</p>
            {feedbackData.explanation && (
              <p className="text-sm text-gray-600 mb-2">{feedbackData.explanation}</p>
            )}
            {feedbackData.artistInfo && (
              <div className="text-sm text-gray-600">
                <p><strong>Artist:</strong> {feedbackData.artistInfo.artist}</p>
                <p><strong>Song:</strong> {feedbackData.artistInfo.song}</p>
                {feedbackData.artistInfo.album && <p><strong>Album:</strong> {feedbackData.artistInfo.album}</p>}
                {feedbackData.artistInfo.year && <p><strong>Year:</strong> {feedbackData.artistInfo.year}</p>}
              </div>
            )}
            <p className="text-blue-600 mt-2">+{feedbackData.pointsEarned} points</p>
          </div>
        </div>
      )}
    </div>
  );
};