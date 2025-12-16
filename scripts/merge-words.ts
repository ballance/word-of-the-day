import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read the December 2025 words
const decemberWords = JSON.parse(readFileSync('/tmp/december-words-2025.json', 'utf-8'));

// Read the existing words (January 2026 onwards)
const existingData = JSON.parse(readFileSync(join(process.cwd(), 'data', 'words.json'), 'utf-8'));

// Combine: December 2025 words first (earlier dates), then existing words (2026)
const allWords = [...decemberWords, ...existingData.words];

// Renumber IDs sequentially
allWords.forEach((word, index) => {
  word.id = index + 1;
});

// Create the merged data object
const mergedData = {
  startDate: "20251207", // Start from December 7, 2025
  metadata: {
    version: "1.0",
    totalWords: allWords.length,
    lastUpdated: new Date().toISOString().split('T')[0]
  },
  words: allWords
};

// Write to the words.json file
writeFileSync(
  join(process.cwd(), 'data', 'words.json'),
  JSON.stringify(mergedData, null, 2)
);

console.log(`✅ Merged ${decemberWords.length} December 2025 words with ${existingData.words.length} existing words`);
console.log(`📊 Total words: ${allWords.length}`);
console.log(`📅 Date range: December 7, 2025 - April 10, 2026`);
console.log(`💾 Updated data/words.json`);
