'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Clock, Target } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  userName: string;
  score: number;
  accuracy: number;
  timeSpent: number;
  createdAt: string;
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/v1/quiz/leaderboard');
      if (response.ok) {
        const data = await response.json();
        const processedData = data.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1,
        }));
        setLeaderboard(processedData);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏆 Music Quiz Leaderboard
          </h1>
          <p className="text-lg text-gray-600">
            See how you rank against other music enthusiasts!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-800">Top Score</h3>
            <p className="text-2xl font-bold text-blue-600">
              {leaderboard[0]?.score || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Target className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <h3 className="text-lg font-bold text-gray-800">Best Accuracy</h3>
            <p className="text-2xl font-bold text-green-600">
              {Math.max(...leaderboard.map(entry => entry.accuracy), 0)}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-800">Fastest Time</h3>
            <p className="text-2xl font-bold text-purple-600">
              {leaderboard.length > 0 ? formatTime(Math.min(...leaderboard.map(entry => entry.timeSpent))) : '0:00'}
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <h2 className="text-2xl font-bold">Top Players</h2>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No quiz results yet!</p>
              <p className="text-sm">Be the first to take a quiz and claim the top spot.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-6 flex items-center justify-between border-l-4 ${getRankStyle(entry.rank)}`}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(entry.rank)}
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {entry.userName || `Player ${entry.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{entry.score}</p>
                      <p className="text-xs text-gray-600">Score</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{entry.accuracy}%</p>
                      <p className="text-xs text-gray-600">Accuracy</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{formatTime(entry.timeSpent)}</p>
                      <p className="text-xs text-gray-600">Time</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <a
            href="/quiz"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
          >
            <Trophy size={24} />
            Take Quiz & Join Leaderboard
          </a>
        </div>
      </div>
    </div>
  );
}