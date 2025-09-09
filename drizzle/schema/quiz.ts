import { sql } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { users } from './auth';

// Enum for question types
export const questionTypeEnum = pgEnum('question_type', ['multiple_choice', 'audio_recognition', 'true_false']);

// Enum for difficulty levels
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

// Quiz categories
export const quizCategories = pgTable('quiz_categories', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Quiz questions
export const quizQuestions = pgTable('quiz_questions', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryId: text('category_id')
    .references(() => quizCategories.id),
  type: questionTypeEnum('type').notNull(),
  difficulty: difficultyEnum('difficulty').notNull().default('medium'),
  question: text('question').notNull(),
  audioUrl: text('audio_url'), // For audio recognition questions
  options: jsonb('options'), // JSON array of options for multiple choice
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'),
  points: integer('points').notNull().default(10),
  timeLimit: integer('time_limit').notNull().default(30), // seconds
  artistInfo: jsonb('artist_info'), // Additional info about artist/song
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Quiz sessions
export const quizSessions = pgTable('quiz_sessions', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .references(() => users.id),
  categoryId: text('category_id')
    .references(() => quizCategories.id),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  totalScore: integer('total_score').notNull().default(0),
  totalQuestions: integer('total_questions').notNull().default(0),
  correctAnswers: integer('correct_answers').notNull().default(0),
  timeSpent: integer('time_spent').notNull().default(0), // seconds
  isCompleted: boolean('is_completed').notNull().default(false),
});

// Individual question answers in a session
export const quizAnswers = pgTable('quiz_answers', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sessionId: text('session_id')
    .notNull()
    .references(() => quizSessions.id),
  questionId: text('question_id')
    .notNull()
    .references(() => quizQuestions.id),
  userAnswer: text('user_answer'),
  isCorrect: boolean('is_correct').notNull(),
  pointsEarned: integer('points_earned').notNull().default(0),
  timeSpent: integer('time_spent').notNull().default(0), // seconds
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
});

// Leaderboard/high scores
export const quizLeaderboard = pgTable('quiz_leaderboard', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  categoryId: text('category_id')
    .references(() => quizCategories.id),
  sessionId: text('session_id')
    .notNull()
    .references(() => quizSessions.id),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  accuracy: integer('accuracy').notNull(), // percentage
  timeSpent: integer('time_spent').notNull(), // seconds
  createdAt: timestamp('created_at').notNull().defaultNow(),
});