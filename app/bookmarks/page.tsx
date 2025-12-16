'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWordByDate } from '@/lib/words';
import { getBookmarks, clearAllBookmarks } from '@/lib/bookmarks';
import { format, parse } from 'date-fns';
import { Word } from '@/types/word';

export default function BookmarksPage() {
  const [bookmarkedWords, setBookmarkedWords] = useState<Word[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    const bookmarkDates = getBookmarks();
    const words = bookmarkDates
      .map(date => getWordByDate(date))
      .filter((word): word is Word => word !== null)
      .reverse(); // Most recent first
    setBookmarkedWords(words);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all bookmarks?')) {
      clearAllBookmarks();
      setBookmarkedWords([]);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading bookmarks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Today's Word
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Bookmarked Words
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {bookmarkedWords.length} {bookmarkedWords.length === 1 ? 'word' : 'words'} saved
              </p>
            </div>
            {bookmarkedWords.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {bookmarkedWords.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No bookmarks yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Bookmark your favorite words to find them here
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Browse Words
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedWords.map((word) => {
              const displayDate = format(parse(word.date, 'yyyyMMdd', new Date()), 'MMM d, yyyy');
              return (
                <Link
                  key={word.date}
                  href={`/${word.date}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group relative"
                >
                  <div className="absolute top-4 right-4">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-300"
                      fill="currentColor"
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
                  </div>

                  <div className="mb-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {word.word}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {displayDate}
                    </p>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {word.definition}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                      {word.partOfSpeech}
                    </span>
                    {word.difficulty && (
                      <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                        {word.difficulty}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
