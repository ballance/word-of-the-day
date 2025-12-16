'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parse, isValid, isBefore } from 'date-fns';

export default function NotFound() {
  const pathname = usePathname();
  const slug = pathname?.split('/').filter(Boolean)[0] || '';

  // Check if the slug looks like a date (8 digits)
  const isDateFormat = /^\d{8}$/.test(slug);

  let message = "This word doesn't exist in our vocabulary yet. Perhaps it's waiting to be discovered on another day!";
  let emoji = "🔍";

  if (isDateFormat) {
    try {
      const date = parse(slug, 'yyyyMMdd', new Date());
      if (isValid(date)) {
        const startDate = parse('20251207', 'yyyyMMdd', new Date()); // Our start date

        if (isBefore(date, startDate)) {
          message = `We started our word of the day journey on December 7, 2025. This date is before we began. Start with our first word!`;
          emoji = "📚";
        } else {
          message = `We don't have a word scheduled for ${date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })} yet. Check out today's word instead!`;
          emoji = "📅";
        }
      }
    } catch (e) {
      // Invalid date format, use default message
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-6xl">{emoji}</div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Word Not Found
        </h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-md">
          {message}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Today&apos;s Word
          </Link>
          {isDateFormat && isBefore(parse(slug, 'yyyyMMdd', new Date()), parse('20251207', 'yyyyMMdd', new Date())) && (
            <Link
              href="/20251207"
              className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              First Word
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
