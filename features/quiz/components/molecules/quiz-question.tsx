import React, { useState } from 'react';
import { AnswerOption } from '../atoms/answer-option';
import { AudioPlayer } from '../atoms/audio-player';
import { QuestionType } from '../../config/quiz.types';

interface QuizQuestionProps {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  audioUrl?: string;
  onAnswer: (answer: string) => void;
  isAnswered?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  className?: string;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  id,
  type,
  question,
  options = [],
  audioUrl,
  onAnswer,
  isAnswered = false,
  correctAnswer,
  userAnswer,
  className = ''
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(option);
    onAnswer(option);
  };

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {options.map((option, index) => (
        <AnswerOption
          key={index}
          option={option}
          isSelected={selectedAnswer === option || userAnswer === option}
          isCorrect={isAnswered && option === correctAnswer}
          isIncorrect={isAnswered && (selectedAnswer === option || userAnswer === option) && option !== correctAnswer}
          isDisabled={isAnswered}
          onClick={() => handleOptionClick(option)}
        />
      ))}
    </div>
  );

  const renderTrueFalse = () => (
    <div className="space-y-3">
      {['True', 'False'].map((option) => (
        <AnswerOption
          key={option}
          option={option}
          isSelected={selectedAnswer === option || userAnswer === option}
          isCorrect={isAnswered && option === correctAnswer}
          isIncorrect={isAnswered && (selectedAnswer === option || userAnswer === option) && option !== correctAnswer}
          isDisabled={isAnswered}
          onClick={() => handleOptionClick(option)}
        />
      ))}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border ${className}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-4">{question}</h2>
      
      {type === 'audio_recognition' && audioUrl && (
        <div className="mb-6">
          <AudioPlayer audioUrl={audioUrl} />
        </div>
      )}
      
      {type === 'multiple_choice' && renderMultipleChoice()}
      {type === 'true_false' && renderTrueFalse()}
      {type === 'audio_recognition' && renderMultipleChoice()}
    </div>
  );
};