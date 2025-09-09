import React from 'react';

interface AnswerOptionProps {
  option: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  className?: string;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  isSelected,
  isCorrect,
  isIncorrect,
  isDisabled,
  onClick,
  className = ''
}) => {
  const getButtonStyles = () => {
    if (isCorrect) return 'bg-green-500 text-white border-green-500';
    if (isIncorrect) return 'bg-red-500 text-white border-red-500';
    if (isSelected) return 'bg-blue-500 text-white border-blue-500';
    return 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50';
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full p-4 text-left border-2 rounded-lg transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-70
        ${getButtonStyles()}
        ${className}
      `}
    >
      <span className="font-medium">{option}</span>
    </button>
  );
};