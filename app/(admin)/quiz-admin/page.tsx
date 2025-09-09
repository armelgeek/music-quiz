'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Music } from 'lucide-react';

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'audio_recognition';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryId?: string;
  isActive: boolean;
}

interface QuizCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function AdminQuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
    type: 'multiple_choice',
    difficulty: 'medium',
    points: 10,
    timeLimit: 30,
    isActive: true,
    options: ['', '', '', ''],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/v1/quiz/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      // For now, we don't have a questions API endpoint, so we'll show empty state
      setQuestions([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newQuestion.question || !newQuestion.correctAnswer) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Here you would call your API to create the question
      console.log('Creating question:', newQuestion);
      
      // For demo purposes, just add to local state
      const questionToAdd = {
        ...newQuestion,
        id: Date.now().toString(),
      } as QuizQuestion;
      
      setQuestions(prev => [...prev, questionToAdd]);
      setNewQuestion({
        type: 'multiple_choice',
        difficulty: 'medium',
        points: 10,
        timeLimit: 30,
        isActive: true,
        options: ['', '', '', ''],
      });
      setShowAddForm(false);
      
      alert('Question added successfully! (Demo mode)');
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quiz Administration</h1>
          <p className="text-gray-600">Manage quiz questions and categories</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Add Question
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{questions.length}</p>
              <p className="text-sm text-gray-600">Total Questions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{questions.filter(q => q.isActive).length}</p>
              <p className="text-sm text-gray-600">Active Questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Question</h2>
          
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="audio_recognition">Audio Recognition</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newQuestion.categoryId || ''}
                  onChange={(e) => setNewQuestion({...newQuestion, categoryId: e.target.value || undefined})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General/Mixed</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
              <textarea
                value={newQuestion.question || ''}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            {(newQuestion.type === 'multiple_choice' || newQuestion.type === 'audio_recognition') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer Options</label>
                <div className="space-y-2">
                  {(newQuestion.options || []).map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(newQuestion.options || [])];
                        newOptions[index] = e.target.value;
                        setNewQuestion({...newQuestion, options: newOptions});
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
              <input
                type="text"
                value={newQuestion.correctAnswer || ''}
                onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
              <textarea
                value={newQuestion.explanation || ''}
                onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
                <input
                  type="number"
                  value={newQuestion.timeLimit}
                  onChange={(e) => setNewQuestion({...newQuestion, timeLimit: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="300"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Question
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
        </div>
        
        {questions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No questions yet</p>
            <p className="text-sm">Add your first quiz question to get started.</p>
          </div>
        ) : (
          <div className="divide-y">
            {questions.map((question) => (
              <div key={question.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        question.type === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                        question.type === 'true_false' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {question.type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {question.points} pts
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">{question.question}</h3>
                    <p className="text-sm text-gray-600">Correct Answer: {question.correctAnswer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}