'use client';

import { Word } from '@/types/word';
import { useState } from 'react';
import SocialShare from './SocialShare';
import BookmarkButton from './BookmarkButton';

interface WordCardProps {
  word: Word;
}

export default function WordCard({ word }: WordCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePronounce = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(word.word);

      // Use a slower rate for clearer pronunciation
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Reset speaking state when done
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {word.word}
          </h1>
          <button
            onClick={handlePronounce}
            disabled={isSpeaking}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Pronounce word"
            title="Listen to pronunciation"
          >
            {isSpeaking ? (
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>
          <BookmarkButton wordDate={word.date} />
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          {word.pronunciation}
        </p>
        <div className="flex gap-2 flex-wrap">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            {word.partOfSpeech}
          </span>
          {word.difficulty && (
            <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
              {word.difficulty}
            </span>
          )}
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Definition
        </h2>
        <p className="text-lg text-gray-900 dark:text-gray-300 leading-relaxed">
          {word.definition}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Example
        </h2>
        <p className="text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed border-l-4 border-blue-500 pl-4">
          {word.example}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Etymology
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {word.etymology}
        </p>
      </section>

      {word.synonyms && word.synonyms.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            Synonyms
          </h2>
          <div className="flex flex-wrap gap-2">
            {word.synonyms.map((synonym, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {synonym}
              </span>
            ))}
          </div>
        </section>
      )}

      <SocialShare word={word} />
    </article>
  );
}
