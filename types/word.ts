export interface Word {
  id: number;
  word: string;
  date: string; // YYYYMMDD format
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  etymology: string;
  synonyms: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

export interface WordData {
  startDate: string; // YYYYMMDD format
  metadata?: {
    version: string;
    totalWords: number;
    lastUpdated: string;
  };
  words: Word[];
}
