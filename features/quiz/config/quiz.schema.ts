import { z } from 'zod';

// Quiz category schema
export const quizCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

// Quiz question schema
export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(['multiple_choice', 'audio_recognition', 'true_false']),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  question: z.string().min(1, "Question is required"),
  audioUrl: z.string().url().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  points: z.number().min(1).default(10),
  timeLimit: z.number().min(5).max(300).default(30),
  artistInfo: z.object({
    artist: z.string().optional(),
    song: z.string().optional(),
    album: z.string().optional(),
    year: z.number().optional(),
    genre: z.string().optional(),
  }).optional(),
  isActive: z.boolean().default(true),
});

// Quiz session schema
export const quizSessionSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().optional(),
  totalQuestions: z.number().min(1).max(50).default(10),
});

// Quiz answer schema
export const quizAnswerSchema = z.object({
  sessionId: z.string(),
  questionId: z.string(),
  userAnswer: z.string(),
  timeSpent: z.number().min(0),
});

// Quiz completion schema
export const quizCompletionSchema = z.object({
  sessionId: z.string(),
  answers: z.array(quizAnswerSchema),
});

export type QuizCategory = z.infer<typeof quizCategorySchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizSession = z.infer<typeof quizSessionSchema>;
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export type QuizCompletion = z.infer<typeof quizCompletionSchema>;