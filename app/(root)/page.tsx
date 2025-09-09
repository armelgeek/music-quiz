import Hero from '@/shared/components/atoms/hero';

export default function Home() {
  return (
    <>
      <Hero 
        title="🎵 Music Quiz Challenge!"
        subtitle="Test your music knowledge with our interactive quiz. Discover new songs, artists, and challenge your friends!"
        ctaText="Start Quiz"
        ctaHref="/quiz"
      />
    </>
  );
}
