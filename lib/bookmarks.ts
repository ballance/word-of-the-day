// Client-side bookmark management using localStorage

const BOOKMARKS_KEY = 'word-of-the-day-bookmarks';

export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
}

export function isBookmarked(date: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.includes(date);
}

export function toggleBookmark(date: string): boolean {
  const bookmarks = getBookmarks();
  const index = bookmarks.indexOf(date);

  let newBookmarks: string[];
  let isNowBookmarked: boolean;

  if (index > -1) {
    // Remove bookmark
    newBookmarks = bookmarks.filter(b => b !== date);
    isNowBookmarked = false;
  } else {
    // Add bookmark
    newBookmarks = [...bookmarks, date];
    isNowBookmarked = true;
  }

  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }

  return isNowBookmarked;
}

export function clearAllBookmarks(): void {
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
  }
}
