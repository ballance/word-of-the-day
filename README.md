# Word of the Day

A privacy-respecting, mobile-friendly daily vocabulary builder. Discover a new word every day with comprehensive definitions, examples, etymology, and synonyms.

## What is This?

Word of the Day is a free web application that displays a curated vocabulary word each day. Each word includes:

- **Clear Definition**: Concise, easy-to-understand explanations
- **Pronunciation Guide**: Learn how to say each word correctly
- **Part of Speech**: Understand how the word functions grammatically
- **Example Usage**: See the word used in context
- **Etymology**: Discover the word's linguistic origins
- **Synonyms**: Expand your understanding with related words
- **Difficulty Level**: Know whether a word is beginner, intermediate, or advanced

## Privacy Commitment

**We collect ZERO data:**

- ❌ No analytics
- ❌ No tracking cookies
- ❌ No user accounts
- ❌ No email collection
- ❌ No third-party scripts
- ❌ No advertisements

This is a completely static website hosted on AWS S3. We **cannot** and **do not** collect any information about visitors. Your learning is private.

## Free Forever

This service is provided free of charge with:

- ✅ No advertisements
- ✅ No premium tiers
- ✅ No hidden costs
- ✅ No paywalls

We built this because we believe expanding vocabulary should be accessible to everyone. This is **free as in beer** 🍺

## Features

- **Daily Words**: A new word every day for an entire year (365 words)
- **Flexible URLs**: Access words by name (`/eloquent`) or by date (`/20260109`)
- **Navigation**: Browse previous and next days easily
- **Mobile-Friendly**: Responsive design works on all devices
- **Dark Mode**: Automatic dark mode support based on system preferences
- **Fast & Lightweight**: Static site with minimal JavaScript
- **SEO Optimized**: Each word has proper metadata for search engines

## URL Structure

- **Homepage** (`/`): Automatically shows today's word
- **By Word** (`/[word]`): Access any word by its name (e.g., `/ephemeral`)
- **By Date** (`/[YYYYMMDD]`): Access any word by its publication date (e.g., `/20260101`)

All dates and word names work! The site intelligently resolves both URL formats to the same content.

## Technical Details

### Built With

- **[Next.js 15](https://nextjs.org/)**: React framework with static export
- **[React 19](https://react.dev/)**: UI library
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling
- **[date-fns](https://date-fns.org/)**: Date manipulation
- **AWS S3**: Static website hosting

### Architecture

This is a **fully static site** generated at build time:

- All 730 routes (365 dates + 365 word names) are pre-generated
- No server-side rendering or API calls
- Complete content stored in a single JSON file
- Client-side date detection for "today's word" on homepage

### Content Structure

Words are stored in `/data/words.json` with this schema:

```json
{
  "startDate": "20260101",
  "words": [
    {
      "id": 1,
      "word": "ephemeral",
      "date": "20260101",
      "pronunciation": "ih-FEM-er-uhl",
      "partOfSpeech": "adjective",
      "definition": "Lasting for a very short time; fleeting.",
      "example": "The ephemeral beauty of cherry blossoms...",
      "etymology": "From Greek 'ephēmeros'...",
      "synonyms": ["transient", "fleeting", "momentary"],
      "difficulty": "intermediate",
      "tags": ["time", "philosophy"]
    }
  ]
}
```

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. **Clone or download this repository**

   ```bash
   git clone <your-repo-url>
   cd word-of-the-day
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build static export for production
- `npm start` - Start production server (requires `npm run build` first)
- `npm run lint` - Run ESLint

## Adding/Editing Words

### Editing Existing Words

1. Open `/data/words.json`
2. Find the word you want to edit
3. Update any field (definition, example, etc.)
4. Save the file
5. Rebuild the site: `npm run build`

### Adding New Words

1. Open `/data/words.json`
2. Add a new entry to the `words` array
3. Ensure all required fields are present:
   - `id`: Sequential number (should be one more than the last)
   - `word`: The vocabulary word
   - `date`: Publication date in YYYYMMDD format
   - `pronunciation`: Phonetic pronunciation
   - `partOfSpeech`: noun, verb, adjective, etc.
   - `definition`: Clear, concise definition
   - `example`: Sentence using the word in context
   - `etymology`: Origin and history of the word
   - `synonyms`: Array of related words
4. Validate your changes:
   ```bash
   npx ts-node scripts/validate-words.ts
   ```
5. Rebuild: `npm run build`

### Validation

Run the validation script to check for errors:

```bash
npx ts-node scripts/validate-words.ts
```

This checks for:
- Duplicate words or dates
- Missing required fields
- Invalid date formats
- Correct ID sequencing

## Deployment

### AWS S3 Static Hosting

1. **Build the static site**

   ```bash
   npm run build
   ```

   This creates an `out/` directory with all static files.

2. **Create S3 bucket**

   - Name: `wordoftheday.bastionforge.com`
   - Enable static website hosting
   - Set index document: `index.html`
   - Set error document: `404.html`

3. **Configure bucket policy for public read**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::wordoftheday.bastionforge.com/*"
       }
     ]
   }
   ```

4. **Upload files**

   ```bash
   aws s3 sync out/ s3://wordoftheday.bastionforge.com --delete
   ```

5. **Configure CloudFront** (recommended for HTTPS)

   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom SSL certificate
   - Set up cache behaviors

6. **Configure DNS in Route53**

   - Create A record (alias to CloudFront)
   - Point `wordoftheday.bastionforge.com` to CloudFront distribution

### Deployment Updates

To deploy content updates:

```bash
npm run build
aws s3 sync out/ s3://wordoftheday.bastionforge.com --delete
```

## Project Structure

```
word-of-the-day/
├── app/                          # Next.js app directory
│   ├── [slug]/                   # Dynamic route for all words
│   │   └── page.tsx              # Word page component
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage (today's word)
│   ├── not-found.tsx             # 404 page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── WordCard.tsx              # Word display component
│   ├── Navigation.tsx            # Previous/next navigation
│   └── Footer.tsx                # Footer with privacy notice
├── data/                         # Content storage
│   └── words.json                # All vocabulary words
├── lib/                          # Utility functions
│   └── words.ts                  # Word data utilities
├── types/                        # TypeScript types
│   └── word.ts                   # Word interfaces
├── scripts/                      # Helper scripts
│   └── validate-words.ts         # Validation script
├── public/                       # Static assets
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Content Guidelines

When adding words, follow these principles:

1. **Accuracy**: Definitions should be clear and correct
2. **Examples**: Use realistic, relatable examples
3. **Etymology**: Include interesting origin stories
4. **Variety**: Mix difficulty levels and parts of speech
5. **Quality**: Choose words that genuinely expand vocabulary

### Word Selection Criteria

- **30%** beginner (common but powerful words)
- **50%** intermediate (useful academic and professional vocabulary)
- **20%** advanced (rare but valuable words)

Sources can include:
- GRE/SAT word lists
- Classic literature
- Academic writing
- Professional terminology
- Historical or archaic words worth preserving

## Contributing

We welcome contributions! The easiest way to contribute is by adding new words to the collection.

### How to Add a Word (Step-by-Step)

**1. Fork and Clone**

- Click the "Fork" button on GitHub to create your own copy
- Clone your fork locally:
  ```bash
  git clone https://github.com/YOUR-USERNAME/word-of-the-day.git
  cd word-of-the-day
  ```

**2. Install Dependencies**

```bash
npm install
```

**3. Create a Feature Branch**

```bash
git checkout -b add-word-ephemeral
```

Use a descriptive branch name like `add-word-[yourword]`.

**4. Add Your Word**

Edit `data/words.json` and add a new entry:

```json
{
  "id": 366,
  "word": "ephemeral",
  "date": "20270101",
  "pronunciation": "ih-FEM-er-uhl",
  "partOfSpeech": "adjective",
  "definition": "Lasting for a very short time; fleeting.",
  "example": "The ephemeral beauty of cherry blossoms makes them all the more precious.",
  "etymology": "From Greek 'ephēmeros' meaning 'lasting only a day'.",
  "synonyms": ["transient", "fleeting", "momentary", "temporary"],
  "difficulty": "intermediate",
  "tags": ["time", "philosophy"]
}
```

**Important:**
- Use the next sequential ID number
- Use a unique date (check existing dates)
- Include all required fields

**5. Validate Your Word**

Run the validation script to check for errors:

```bash
npm run validate
```

Fix any errors before proceeding.

**6. Test Locally (Optional)**

Build and preview the site:

```bash
npm run build
npm start
```

Visit `http://localhost:3000` to see your word.

**7. Commit Your Changes**

```bash
git add data/words.json
git commit -m "Add word: ephemeral"
```

**8. Push to Your Fork**

```bash
git push origin add-word-ephemeral
```

**9. Submit a Pull Request**

- Go to your fork on GitHub
- Click "Pull Request" → "New Pull Request"
- Select your branch (`add-word-ephemeral`)
- Add a title: "Add word: ephemeral"
- Add description explaining your word choice
- Click "Create Pull Request"

**That's it!** We'll review your contribution and merge it if everything looks good.

### Other Contributions

For bug fixes, features, or documentation improvements:

1. Follow the same fork/branch workflow above
2. Make your changes
3. Test thoroughly
4. Submit a pull request with a clear description

## License

MIT License - Feel free to use this code for your own vocabulary projects!

## Questions or Issues?

If you encounter problems or have questions about the project, please open an issue on GitHub.

---

**Remember**: This site collects no data. Your vocabulary journey is completely private. Enjoy learning!
