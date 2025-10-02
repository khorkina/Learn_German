# Learn German Daily

A static website for learning German from A1 (beginner) to C1 (advanced) levels. All progress is stored locally in your browser using IndexedDB.

## Features

- **Structured Learning**: Follow clear paths from A1 to C1 with daily lessons
- **Privacy First**: All data stored locally in browser (no server, no tracking)
- **Interactive Exercises**: Multiple exercise types with instant feedback
- **Progress Tracking**: Track streaks, completed lessons, and vocabulary
- **Offline Support**: Service Worker enables offline access
- **Responsive Design**: Works on desktop, tablet, and mobile
- **GitHub Pages Compatible**: Pure static site, no backend required

## Quick Start

1. Clone or download this repository
2. Open `index.html` in a web browser, or
3. Deploy to GitHub Pages for online access

## Adding Daily Lessons

### Step 1: Create Lesson Content

1. Copy `content/TEMPLATE_lesson.json` to your level folder (e.g., `content/A1/`)
2. Rename it following the pattern: `[level]-lesson-[number].json` (e.g., `a1-lesson-02.json`)
3. Fill in the lesson content:
   - **title**: Lesson name
   - **level**: A1, A2, B1, B2, or C1
   - **number**: Lesson number
   - **grammar**: Array of grammar topics with explanations and examples
   - **vocabulary**: Array of German words with English translations
   - **phrases**: Array of useful phrases with translations

### Step 2: Create Exercises

1. Copy `content/TEMPLATE_exercises.json` to the same level folder
2. Rename it: `[level]-lesson-[number]-exercises.json` (e.g., `a1-lesson-02-exercises.json`)
3. Create exercises:
   - **fill-in**: User types the answer
   - **multiple-choice**: User selects from options

### Step 3: Update Manifest

Add your lesson to `content/manifest.json`:

```json
{
  "id": "a1-lesson-02",
  "level": "A1",
  "number": 2,
  "title": "Your Lesson Title",
  "description": "Brief description",
  "file": "a1-lesson-02.json",
  "exercisesFile": "a1-lesson-02-exercises.json"
}
```

### Step 4: Test

Open the site and navigate to:
- **Library** to see your new lesson
- **Daily Lesson** will show it if it's the next incomplete lesson
- **Exercises** to test the exercises

## Project Structure

```
/
├── index.html              # Homepage
├── pages/                  # All other pages
│   ├── levels.html
│   ├── daily-lesson.html
│   ├── library.html
│   ├── exercises.html
│   ├── progress.html
│   ├── about.html
│   ├── privacy.html
│   └── contact.html
├── styles/                 # CSS files
│   ├── tokens.css         # Design tokens (colors, spacing, etc.)
│   ├── main.css           # Base styles
│   └── pages.css          # Page-specific styles
├── scripts/               # JavaScript files
│   ├── db.js             # IndexedDB wrapper
│   ├── main.js           # Main application logic
│   ├── levels.js         # Levels page
│   ├── lesson.js         # Lesson display
│   ├── library.js        # Library page
│   ├── exercises.js      # Exercise system
│   └── progress.js       # Progress tracking
├── content/              # Lesson content
│   ├── manifest.json     # Lesson index
│   ├── TEMPLATE_lesson.json
│   ├── TEMPLATE_exercises.json
│   ├── A1/              # A1 lessons
│   ├── A2/              # A2 lessons
│   ├── B1/              # B1 lessons
│   ├── B2/              # B2 lessons
│   └── C1/              # C1 lessons
├── service-worker.js     # Offline support
├── adsense-config.js     # AdSense configuration
├── sitemap.xml          # SEO sitemap
├── robots.txt           # Search engine instructions
└── README.md            # This file
```

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Storage**: IndexedDB (with localStorage fallback)
- **Offline**: Service Worker API
- **Hosting**: GitHub Pages compatible

## Design System

The site uses a beige/brown/white color palette defined in `styles/tokens.css`:
- Background colors in soft beige tones
- Brown accents for interactive elements
- Rounded corners and subtle shadows
- Mobile-first responsive design

## Privacy & Data

All user data (progress, vocabulary, streaks, settings) is stored locally in the browser:
- No server-side storage
- No user accounts required
- No tracking or analytics (unless you add AdSense)
- Data persists in browser until cleared by user

## Google AdSense Integration

To enable ads:

1. Edit `adsense-config.js` and set `enabled: true`
2. Add your AdSense publisher ID
3. Configure ad slots with your ad unit IDs
4. Add the AdSense script to your HTML files
5. Place ad containers in your HTML where desired

Ads are disabled by default to keep the learning experience clean.

## GitHub Pages Deployment

1. Push this repository to GitHub
2. Go to repository Settings > Pages
3. Select branch (usually `main`) and root folder
4. Your site will be available at `https://[username].github.io/[repo-name]/`
5. Update `sitemap.xml` and `robots.txt` with your actual domain

## Browser Compatibility

- Modern browsers with IndexedDB support (Chrome, Firefox, Safari, Edge)
- Falls back to localStorage if IndexedDB unavailable
- Service Worker requires HTTPS (works with GitHub Pages)

## Contributing Lessons

To contribute lesson content:
1. Follow the template structure
2. Ensure grammar explanations are clear and original
3. Provide accurate translations
4. Include diverse examples
5. Test exercises thoroughly
6. Do not include copyrighted textbook content

## License

Content and code are provided for educational purposes. Please respect copyright and create original lesson content.

## Support

For questions, issues, or suggestions, please open an issue on the GitHub repository.

---

**Happy Learning! Viel Erfolg!**
