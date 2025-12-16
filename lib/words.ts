import wordsData from '@/data/words.json';
import { Word, WordData } from '@/types/word';
import { addDays, format, parse } from 'date-fns';

const data: WordData = wordsData as WordData;

/**
 * Get all words from the data file
 */
export function getAllWords(): Word[] {
  return data.words;
}

/**
 * Get a word by its date (YYYYMMDD format)
 */
export function getWordByDate(dateString: string): Word | null {
  return data.words.find(w => w.date === dateString) || null;
}

/**
 * Get a word by its word name (case-insensitive)
 */
export function getWordByName(word: string): Word | null {
  return data.words.find(w => w.word.toLowerCase() === word.toLowerCase()) || null;
}

/**
 * Get a word by slug - handles both date and word name formats
 */
export function getWordBySlug(slug: string): Word | null {
  // Check if slug is a date (8 digits)
  if (/^\d{8}$/.test(slug)) {
    return getWordByDate(slug);
  }
  // Otherwise treat as word name
  return getWordByName(slug);
}

/**
 * Get the previous word in the sequence
 */
export function getPreviousWord(currentDate: string): Word | null {
  const currentWord = getWordByDate(currentDate);
  if (!currentWord || currentWord.id === 1) return null;
  return data.words.find(w => w.id === currentWord.id - 1) || null;
}

/**
 * Get the next word in the sequence
 */
export function getNextWord(currentDate: string): Word | null {
  const currentWord = getWordByDate(currentDate);
  if (!currentWord || currentWord.id === data.words.length) return null;
  return data.words.find(w => w.id === currentWord.id + 1) || null;
}

/**
 * Get today's word based on the current date
 */
export function getTodaysWord(): Word | null {
  const today = format(new Date(), 'yyyyMMdd');
  return getWordByDate(today);
}

/**
 * Get all possible slugs for static generation (dates + word names)
 */
export function getAllSlugs(): string[] {
  const slugs: string[] = [];

  data.words.forEach(word => {
    slugs.push(word.date); // Date-based slug
    slugs.push(word.word.toLowerCase()); // Word-based slug
  });

  return slugs;
}

/**
 * Get the start date from the data file
 */
export function getStartDate(): string {
  return data.startDate;
}

/**
 * Get total number of words
 */
export function getTotalWords(): number {
  return data.words.length;
}
