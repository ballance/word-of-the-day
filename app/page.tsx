'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { getAllWords } from '@/lib/words';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get today's date in YYYYMMDD format
    const today = format(new Date(), 'yyyyMMdd');

    // Get all words to check if today's date exists in our data
    const allWords = getAllWords();
    const todaysWord = allWords.find(w => w.date === today);

    if (todaysWord) {
      // Redirect to today's word
      router.push(`/${today}`);
    } else {
      // If today's date is not in our data, redirect to the first word
      // This handles the case where the site is accessed before the start date
      if (allWords.length > 0) {
        router.push(`/${allWords[0].date}`);
      }
    }

    setIsLoading(false);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {isLoading ? (
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Word of the Day
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Loading today&apos;s word...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Word of the Day
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
          </div>
        )}
      </div>
    </main>
  );
}
