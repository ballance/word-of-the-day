import { readFileSync } from 'fs';
import { join } from 'path';
import { WordData } from '../types/word';

function validateWords() {
  console.log('🔍 Validating words.json...\n');

  try {
    // Read the words.json file
    const filePath = join(process.cwd(), 'data', 'words.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data: WordData = JSON.parse(fileContent);

    let errors = 0;
    let warnings = 0;

    // Check if we have words
    if (!data.words || data.words.length === 0) {
      console.error('❌ No words found in data file');
      errors++;
      return;
    }

    console.log(`📚 Total words: ${data.words.length}`);
    console.log(`📅 Start date: ${data.startDate}\n`);

    // Track duplicates
    const seenWords = new Set<string>();
    const seenDates = new Set<string>();
    const seenIds = new Set<number>();

    // Validate each word
    data.words.forEach((word, index) => {
      const requiredFields = ['id', 'word', 'date', 'pronunciation', 'partOfSpeech', 'definition', 'example', 'etymology'];

      // Check required fields
      requiredFields.forEach(field => {
        if (!word[field as keyof typeof word]) {
          console.error(`❌ Word ${index + 1}: Missing required field "${field}"`);
          errors++;
        }
      });

      // Check for duplicate words
      const wordLower = word.word.toLowerCase();
      if (seenWords.has(wordLower)) {
        console.error(`❌ Duplicate word found: "${word.word}"`);
        errors++;
      }
      seenWords.add(wordLower);

      // Check for duplicate dates
      if (seenDates.has(word.date)) {
        console.error(`❌ Duplicate date found: ${word.date}`);
        errors++;
      }
      seenDates.add(word.date);

      // Check for duplicate IDs
      if (seenIds.has(word.id)) {
        console.error(`❌ Duplicate ID found: ${word.id}`);
        errors++;
      }
      seenIds.add(word.id);

      // Validate date format (YYYYMMDD)
      if (!/^\d{8}$/.test(word.date)) {
        console.error(`❌ Word "${word.word}": Invalid date format "${word.date}" (should be YYYYMMDD)`);
        errors++;
      }

      // Check if ID matches position
      if (word.id !== index + 1) {
        console.warn(`⚠️  Word "${word.word}": ID ${word.id} doesn't match position ${index + 1}`);
        warnings++;
      }

      // Check if synonyms exist
      if (!word.synonyms || word.synonyms.length === 0) {
        console.warn(`⚠️  Word "${word.word}": No synonyms provided`);
        warnings++;
      }
    });

    // Check if we have exactly 365 words (optional - just a warning)
    if (data.words.length !== 365) {
      console.warn(`⚠️  Expected 365 words, found ${data.words.length}`);
      warnings++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (errors === 0 && warnings === 0) {
      console.log('✅ All validations passed!');
    } else {
      if (errors > 0) {
        console.error(`❌ Found ${errors} error(s)`);
      }
      if (warnings > 0) {
        console.warn(`⚠️  Found ${warnings} warning(s)`);
      }
    }

    process.exit(errors > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Error reading or parsing words.json:');
    console.error(error);
    process.exit(1);
  }
}

validateWords();
