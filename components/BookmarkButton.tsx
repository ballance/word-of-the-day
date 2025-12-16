'use client';

import { useState, useEffect } from 'react';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';

interface BookmarkButtonProps {
  wordDate: string;
}

export default function BookmarkButton({ wordDate }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarked(isBookmarked(wordDate));
  }, [wordDate]);

  const handleToggle = () => {
    const newState = toggleBookmark(wordDate);
    setBookmarked(newState);
  };

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
        disabled
        aria-label="Loading bookmark"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
        bookmarked
          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      <svg
        className="w-5 h-5"
        fill={bookmarked ? 'currentColor' : 'none'}
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
    </button>
  );
}
