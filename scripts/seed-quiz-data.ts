import { db } from '@/drizzle/db';
import { quizCategories, quizQuestions } from '@/drizzle/schema';

async function seedQuizData() {
  console.log('Seeding quiz data...');

  // Create categories
  const categories = await db
    .insert(quizCategories)
    .values([
      {
        name: 'Pop Music',
        description: 'Test your knowledge of popular music from the 70s to today',
        isActive: true,
      },
      {
        name: 'Rock & Alternative',
        description: 'Classic rock, alternative rock, and everything in between',
        isActive: true,
      },
      {
        name: 'Hip-Hop & R&B',
        description: 'Urban music, rap, and rhythm & blues',
        isActive: true,
      },
      {
        name: 'Electronic & Dance',
        description: 'EDM, techno, house, and electronic music',
        isActive: true,
      },
      {
        name: 'Classical & Jazz',
        description: 'Classical music and jazz standards',
        isActive: true,
      },
    ])
    .returning();

  console.log('Created categories:', categories.length);

  // Get category IDs
  const popCategory = categories.find(c => c.name === 'Pop Music');
  const rockCategory = categories.find(c => c.name === 'Rock & Alternative');
  const hiphopCategory = categories.find(c => c.name === 'Hip-Hop & R&B');

  // Create sample questions
  const questions = [
    // Pop Music Questions
    {
      categoryId: popCategory?.id,
      type: 'multiple_choice' as const,
      difficulty: 'easy' as const,
      question: 'Which artist released the album "Thriller" in 1982?',
      options: ['Michael Jackson', 'Prince', 'Madonna', 'Whitney Houston'],
      correctAnswer: 'Michael Jackson',
      explanation: 'Michael Jackson\'s "Thriller" became the best-selling album of all time.',
      points: 10,
      timeLimit: 30,
      artistInfo: {
        artist: 'Michael Jackson',
        album: 'Thriller',
        year: 1982,
        genre: 'Pop'
      },
      isActive: true,
    },
    {
      categoryId: popCategory?.id,
      type: 'multiple_choice' as const,
      difficulty: 'medium' as const,
      question: 'What year did Taylor Swift release her album "1989"?',
      options: ['2012', '2013', '2014', '2015'],
      correctAnswer: '2014',
      explanation: '"1989" marked Taylor Swift\'s transition from country to pop music.',
      points: 15,
      timeLimit: 25,
      artistInfo: {
        artist: 'Taylor Swift',
        album: '1989',
        year: 2014,
        genre: 'Pop'
      },
      isActive: true,
    },
    {
      categoryId: popCategory?.id,
      type: 'true_false' as const,
      difficulty: 'easy' as const,
      question: 'Madonna is known as the "Queen of Pop".',
      correctAnswer: 'True',
      explanation: 'Madonna earned this title through her influence on pop music and culture.',
      points: 10,
      timeLimit: 20,
      artistInfo: {
        artist: 'Madonna',
        genre: 'Pop'
      },
      isActive: true,
    },
    
    // Rock Questions
    {
      categoryId: rockCategory?.id,
      type: 'multiple_choice' as const,
      difficulty: 'medium' as const,
      question: 'What year was "Bohemian Rhapsody" by Queen released?',
      options: ['1975', '1976', '1977', '1978'],
      correctAnswer: '1975',
      explanation: '"Bohemian Rhapsody" was released in 1975 as part of the album "A Night at the Opera".',
      points: 15,
      timeLimit: 30,
      artistInfo: {
        artist: 'Queen',
        song: 'Bohemian Rhapsody',
        album: 'A Night at the Opera',
        year: 1975,
        genre: 'Rock'
      },
      isActive: true,
    },
    {
      categoryId: rockCategory?.id,
      type: 'multiple_choice' as const,
      difficulty: 'easy' as const,
      question: 'Which instrument is Jimi Hendrix most famous for playing?',
      options: ['Piano', 'Guitar', 'Drums', 'Bass'],
      correctAnswer: 'Guitar',
      explanation: 'Jimi Hendrix revolutionized electric guitar playing and is considered one of the greatest guitarists of all time.',
      points: 10,
      timeLimit: 25,
      artistInfo: {
        artist: 'Jimi Hendrix',
        genre: 'Rock'
      },
      isActive: true,
    },
    {
      categoryId: rockCategory?.id,
      type: 'true_false' as const,
      difficulty: 'easy' as const,
      question: 'The Beatles were formed in Liverpool, England.',
      correctAnswer: 'True',
      explanation: 'The Beatles were indeed formed in Liverpool in 1960.',
      points: 10,
      timeLimit: 20,
      artistInfo: {
        artist: 'The Beatles',
        genre: 'Rock'
      },
      isActive: true,
    },
    
    // Hip-Hop Questions
    {
      categoryId: hiphopCategory?.id,
      type: 'multiple_choice' as const,
      difficulty: 'medium' as const,
      question: 'Which rapper released the album "The Chronic" in 1992?',
      options: ['Snoop Dogg', 'Dr. Dre', 'Ice Cube', 'Eazy-E'],
      correctAnswer: 'Dr. Dre',
      explanation: '"The Chronic" was Dr. Dre\'s debut solo album and helped launch G-funk.',
      points: 15,
      timeLimit: 30,
      artistInfo: {
        artist: 'Dr. Dre',
        album: 'The Chronic',
        year: 1992,
        genre: 'Hip-Hop'
      },
      isActive: true,
    },
    {
      categoryId: hiphopCategory?.id,
      type: 'true_false' as const,
      difficulty: 'easy' as const,
      question: 'Jay-Z and Beyoncé are married.',
      correctAnswer: 'True',
      explanation: 'Jay-Z and Beyoncé got married in 2008.',
      points: 10,
      timeLimit: 20,
      artistInfo: {
        artist: 'Jay-Z & Beyoncé',
        genre: 'Hip-Hop/R&B'
      },
      isActive: true,
    },

    // General questions (no category)
    {
      type: 'multiple_choice' as const,
      difficulty: 'easy' as const,
      question: 'Which of these is a music streaming service?',
      options: ['Netflix', 'Spotify', 'Instagram', 'Twitter'],
      correctAnswer: 'Spotify',
      explanation: 'Spotify is one of the world\'s largest music streaming platforms.',
      points: 10,
      timeLimit: 25,
      isActive: true,
    },
    {
      type: 'true_false' as const,
      difficulty: 'easy' as const,
      question: 'A standard guitar has 6 strings.',
      correctAnswer: 'True',
      explanation: 'Most standard guitars have 6 strings, though there are variations.',
      points: 10,
      timeLimit: 20,
      isActive: true,
    },
  ];

  const insertedQuestions = await db
    .insert(quizQuestions)
    .values(questions)
    .returning();

  console.log('Created questions:', insertedQuestions.length);
  console.log('Quiz data seeding completed!');
}

// Run the seeding function
seedQuizData().catch(console.error);