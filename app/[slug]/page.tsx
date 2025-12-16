import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getWordBySlug, getAllSlugs, getPreviousWord, getNextWord } from '@/lib/words';
import WordDisplay from '@/components/WordDisplay';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map(slug => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const word = getWordBySlug(slug);

  if (!word) {
    return {
      title: 'Word Not Found',
    };
  }

  return {
    title: `${word.word} - Word of the Day`,
    description: word.definition,
    keywords: [word.word, 'definition', 'vocabulary', 'word of the day', ...word.synonyms],
    openGraph: {
      title: `${word.word} - Word of the Day`,
      description: word.definition,
      type: 'article',
    },
    alternates: {
      canonical: `/${word.date}`,
    },
  };
}

export default async function WordPage({ params }: PageProps) {
  const { slug } = await params;
  const word = getWordBySlug(slug);

  if (!word) {
    notFound();
  }

  const previousWord = getPreviousWord(word.date);
  const nextWord = getNextWord(word.date);

  return <WordDisplay word={word} previousWord={previousWord} nextWord={nextWord} />;
}
