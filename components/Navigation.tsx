'use client';

import Link from 'next/link';
import { Word } from '@/types/word';
import { format, parse, isAfter } from 'date-fns';
import { useState, useEffect } from 'react';
import { getAllWords } from '@/lib/words';
import { useRouter } from 'next/navigation';

interface NavigationProps {
  currentDate: string;
  previousWord: Word | null;
  nextWord: Word | null;
}

export default function Navigation({ currentDate, previousWord, nextWord }: NavigationProps) {
  const router = useRouter();

  // Format the current date for display
  const displayDate = format(parse(currentDate, 'yyyyMMdd', new Date()), 'MMMM d, yyyy');

  // Client-side check for whether to show Next button
  const [shouldShowNext, setShouldShowNext] = useState(false);

  useEffect(() => {
    // Only show next button if there's a next word AND it's not in the future
    if (nextWord) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWordDate = parse(nextWord.date, 'yyyyMMdd', new Date());
      setShouldShowNext(!isAfter(nextWordDate, today));
    }
  }, [nextWord]);

  const handleRandomWord = () => {
    const allWords = getAllWords();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter to only include words that are not in the future and not the current word
    const availableWords = allWords.filter(word => {
      const wordDate = parse(word.date, 'yyyyMMdd', new Date());
      return !isAfter(wordDate, today) && word.date !== currentDate;
    });

    if (availableWords.length > 0) {
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      router.push(`/${randomWord.date}`);
    }
  };

  return (
    <nav className="flex justify-between items-center mb-4">
      <div className="flex-1">
        {previousWord ? (
          <Link
            href={`/${previousWord.date}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </Link>
        ) : (
          <div className="inline-flex items-center px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </div>
        )}
      </div>

      <div className="flex-1 text-center">
        <Link
          href="/"
          className="inline-block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <div className="text-sm font-medium">Word of the Day</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{displayDate}</div>
        </Link>
        <div className="mt-2 flex gap-2 justify-center">
          <button
            onClick={handleRandomWord}
            className="inline-flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
            aria-label="Random word"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Random Word
          </button>
          <Link
            href="/words"
            className="inline-flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            aria-label="Browse all words"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Browse All
          </Link>
          <Link
            href="/bookmarks"
            className="inline-flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
            aria-label="View bookmarks"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            Bookmarks
          </Link>
        </div>
      </div>

      <div className="flex-1 flex justify-end">
        {shouldShowNext ? (
          <Link
            href={`/${nextWord!.date}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Next
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
