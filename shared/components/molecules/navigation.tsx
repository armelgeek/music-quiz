import React from 'react';
import Link from 'next/link';
import { Music, Trophy, Settings } from 'lucide-react';

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Music className="w-6 h-6 text-blue-500" />
            Music Quiz
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/quiz" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Take Quiz
            </Link>
            <Link 
              href="/quiz/leaderboard" 
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Trophy size={16} />
              Leaderboard
            </Link>
            <Link 
              href="/d/quiz" 
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Settings size={16} />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};