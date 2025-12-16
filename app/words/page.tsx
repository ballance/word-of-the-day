'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllWords } from '@/lib/words';
import { format, parse } from 'date-fns';

export default function WordsPage() {
  const allWords = getAllWords();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPartOfSpeech, setSelectedPartOfSpeech] = useState<string>('all');

  // Extract unique difficulties and parts of speech
  const difficulties = useMemo(() => {
    const unique = new Set(allWords.filter(w => w.difficulty).map(w => w.difficulty));
    return Array.from(unique).sort();
  }, [allWords]);

  const partsOfSpeech = useMemo(() => {
    const unique = new Set(allWords.map(w => w.partOfSpeech));
    return Array.from(unique).sort();
  }, [allWords]);

  // Filter words based on search and filters
  const filteredWords = useMemo(() => {
    return allWords.filter(word => {
      const matchesSearch = searchQuery === '' ||
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty = selectedDifficulty === 'all' ||
        word.difficulty === selectedDifficulty;

      const matchesPartOfSpeech = selectedPartOfSpeech === 'all' ||
        word.partOfSpeech === selectedPartOfSpeech;

      return matchesSearch && matchesDifficulty && matchesPartOfSpeech;
    });
  }, [allWords, searchQuery, selectedDifficulty, selectedPartOfSpeech]);

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Word Archive
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and search through all words
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by word or definition..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            {/* Part of Speech Filter */}
            <div>
              <label htmlFor="partOfSpeech" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Part of Speech
              </label>
              <select
                id="partOfSpeech"
                value={selectedPartOfSpeech}
                onChange={(e) => setSelectedPartOfSpeech(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Parts of Speech</option>
                {partsOfSpeech.map(pos => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredWords.length} of {allWords.length} words
              </p>
            </div>
          </div>
        </div>

        {/* Words Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => {
            const displayDate = format(parse(word.date, 'yyyyMMdd', new Date()), 'MMM d, yyyy');
            return (
              <Link
                key={word.date}
                href={`/${word.date}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
              >
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

        {filteredWords.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No words found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
