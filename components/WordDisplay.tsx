'use client';

import { Word } from '@/types/word';
import WordCard from '@/components/WordCard';
import Navigation from '@/components/Navigation';
import KeyboardHelp from '@/components/KeyboardHelp';
import { parse, isAfter } from 'date-fns';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WordDisplayProps {
  word: Word;
  previousWord: Word | null;
  nextWord: Word | null;
}

export default function WordDisplay({ word, previousWord, nextWord }: WordDisplayProps) {
  const [isFutureWord, setIsFutureWord] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if word is in the future (client-side check)
    const wordDate = parse(word.date, 'yyyyMMdd', new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    setIsFutureWord(isAfter(wordDate, today));
  }, [word.date]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Left arrow or 'p' for previous
      if ((e.key === 'ArrowLeft' || e.key === 'p') && previousWord) {
        router.push(`/${previousWord.date}`);
      }

      // Right arrow or 'n' for next
      if ((e.key === 'ArrowRight' || e.key === 'n') && nextWord) {
        // Check if next word is not in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWordDate = parse(nextWord.date, 'yyyyMMdd', new Date());
        if (!isAfter(nextWordDate, today)) {
          router.push(`/${nextWord.date}`);
        }
      }

      // 'h' or '/' for home
      if (e.key === 'h' || e.key === '/') {
        router.push('/');
      }

      // 'b' for bookmarks
      if (e.key === 'b') {
        router.push('/bookmarks');
      }

      // 'a' for all words
      if (e.key === 'a') {
        router.push('/words');
      }

      // 'r' for random word
      if (e.key === 'r') {
        const allWords = require('@/lib/words').getAllWords();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const availableWords = allWords.filter((w: Word) => {
          const wordDate = parse(w.date, 'yyyyMMdd', new Date());
          return !isAfter(wordDate, today) && w.date !== word.date;
        });
        if (availableWords.length > 0) {
          const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
          router.push(`/${randomWord.date}`);
        }
      }

      // '?' for keyboard help
      if (e.key === '?') {
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousWord, nextWord, word.date, router]);

  // Show loading state until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Navigation
            currentDate={word.date}
            previousWord={previousWord}
            nextWord={nextWord}
          />
          <WordCard word={word} />
        </div>
      </main>
    );
  }

  // If word is in the future, show a message instead
  if (isFutureWord) {
    const wordDate = parse(word.date, 'yyyyMMdd', new Date());
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Navigation
            currentDate={word.date}
            previousWord={previousWord}
            nextWord={null} // Don't show next button for future words
          />
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
            <div className="text-center space-y-6 py-12">
              <div className="text-6xl">📅</div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Coming Soon
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                This word will be revealed on {wordDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}. Check back then to discover a new word!
              </p>
              <div className="pt-4">
                <a
                  href="/"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Return to Today's Word
                </a>
              </div>
            </div>
          </article>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Navigation
          currentDate={word.date}
          previousWord={previousWord}
          nextWord={nextWord}
        />
        <WordCard word={word} />
      </div>
      <KeyboardHelp />
    </main>
  );
}
