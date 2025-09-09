'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Users, Trophy, Play } from 'lucide-react';

interface QuizCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function QuizPage() {
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/quiz/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async (categoryId?: string) => {
    try {
      const response = await fetch('/api/v1/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          totalQuestions: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to play page with both session ID and the actual quiz data
        const params = new URLSearchParams({
          session: data.sessionId,
          data: JSON.stringify(data)
        });
        router.push(`/quiz/play?${params.toString()}`);
      } else {
        alert('Failed to start quiz. Please try again.');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading quiz categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎵 Choose Your Music Challenge
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a category below to test your knowledge, or start with a random mix of questions from all categories.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Start</h2>
            <p className="text-gray-600 mb-6">Jump right in with a random mix of questions</p>
            <button
              onClick={() => startQuiz()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
            >
              <Play size={24} />
              Start Random Quiz
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Or Choose a Specific Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                  onClick={() => startQuiz(category.id)}
                >
                  <div className="text-center">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-16 h-16 mx-auto mb-4 rounded-full object-cover"
                      />
                    ) : (
                      <Music className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                    )}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4">
                        {category.description}
                      </p>
                    )}
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                      Start {category.name} Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <Users className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Compete with Friends</h3>
            <p className="text-gray-600 text-sm">
              Challenge your friends and see who knows music best!
            </p>
          </div>
          <div className="text-center p-6">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Leaderboard</h3>
            <p className="text-gray-600 text-sm">
              Climb the ranks and become the ultimate music quiz champion!
            </p>
          </div>
          <div className="text-center p-6">
            <Music className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Discover Music</h3>
            <p className="text-gray-600 text-sm">
              Learn about new artists, songs, and music history while playing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}