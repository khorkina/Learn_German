# Learn German Daily

## Overview

Learn German Daily is a privacy-first, static web application for learning German from A1 (beginner) to C1 (advanced) levels. The application runs entirely in the browser with no backend infrastructure, making it suitable for deployment on static hosting platforms like GitHub Pages. All user data (progress, vocabulary, streaks, exercise results) is stored locally in the browser using IndexedDB with a localStorage fallback, ensuring complete privacy and offline functionality.

The application provides structured daily lessons with grammar explanations, vocabulary lists, phrases, and interactive exercises (fill-in-the-blank and multiple-choice). Content is organized by CEFR levels (A1, A2, B1, B2, C1) and stored as JSON files that can be easily added or modified without code changes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Static Site Architecture**: Pure HTML/CSS/JavaScript with no build process or framework dependencies. Each page is a separate HTML file with shared stylesheets and modular JavaScript files.

**Navigation Structure**: Multi-page architecture with distinct HTML files for each section (levels, daily lesson, library, exercises, progress). This avoids SPA routing issues on GitHub Pages and provides better SEO and direct linking capabilities.

**Design System**: Token-based CSS architecture with a dedicated `tokens.css` file defining the complete design system (colors, typography, spacing, shadows, transitions). Main styles in `main.css` and page-specific styles in `pages.css` create a modular, maintainable styling approach.

**Color Palette**: Beige/brown/white natural tones (`#FDFBF7` background, `#8B6F47` primary accent, `#3E3731` text) creating a calm, minimalist aesthetic inspired by Ko-fi.

**Responsive Design**: Mobile-first approach with progressive enhancement. Navigation collapses to hamburger menu on small screens. All layouts use CSS flexbox/grid for fluid responsiveness.

### Data Storage & Persistence

**Primary Storage**: IndexedDB via a custom `DatabaseManager` class (`scripts/db.js`) providing a promise-based API for storing user progress, vocabulary, exercise results, streaks, and settings.

**Object Stores**: Five separate stores - PROGRESS (lesson completion), VOCABULARY (learned words), EXERCISES (quiz results), SETTINGS (user preferences), STREAKS (daily learning tracking).

**Fallback Strategy**: Automatic detection and fallback to localStorage when IndexedDB is unavailable, ensuring compatibility across all browsers and contexts (including some private browsing modes).

**No Server Dependency**: All data persistence happens client-side. No authentication, no user accounts, no data transmission to servers. This architectural choice prioritizes privacy and eliminates backend infrastructure requirements.

### Content Management

**JSON-Based Content**: Lessons stored as structured JSON files in `content/[LEVEL]/` directories. Template files (`TEMPLATE_lesson.json`, `TEMPLATE_exercises.json`) provide scaffolding for content authors.

**Manifest System**: Central `manifest.json` file indexes all available lessons with metadata (id, level, number, title, description, file paths). JavaScript modules fetch this manifest to dynamically populate the UI.

**Content Structure**: Each lesson contains grammar topics (with explanations and examples), vocabulary lists (German-English pairs), and phrases. Exercises are stored separately and linked via the manifest.

**Exercise Types**: Two exercise formats supported - "fill-in" (text input with exact or normalized matching) and "multiple-choice" (options array with correct index). Extensible structure allows for future exercise types.

### Offline Capability

**Service Worker**: Implements cache-first strategy for core application files (HTML, CSS, JS, manifest). Caches content files on demand as users access lessons.

**Cache Strategy**: Version-based cache naming (`learn-german-v1`) enables cache invalidation on updates. Network requests fallback to cache, ensuring offline functionality after initial load.

**Static Asset Optimization**: All resources are static files with no dynamic generation, making the service worker implementation straightforward and reliable.

### Page-Specific Logic

**Modular JavaScript**: Separate script files for each major feature - `levels.js` (level browsing), `lesson.js` (lesson display), `library.js` (lesson filtering), `exercises.js` (quiz functionality), `progress.js` (statistics dashboard), `main.js` (shared utilities and navigation).

**Dynamic Lesson Loading**: Lessons can be loaded as "next incomplete lesson" or via direct ID from URL parameters (`?id=a1-lesson-01`), enabling both guided learning paths and random access.

**Progress Tracking**: Lessons can be marked complete, updating IndexedDB and triggering streak calculations. Vocabulary is automatically tracked as "learned" when encountered in completed lessons.

**Exercise Scoring**: Real-time feedback on exercise answers with explanations. Score tracking per session with potential for persistent statistics (structure exists but not fully implemented).

## External Dependencies

### Browser APIs

**IndexedDB API**: Core storage mechanism for all persistent data. Provides async, transactional database access with structured object stores and indexes.

**LocalStorage API**: Fallback storage for environments where IndexedDB is unavailable. Stores serialized JSON data with simplified key-value access.

**Service Worker API**: Enables offline functionality and resource caching. Requires HTTPS (or localhost) for activation.

**Fetch API**: Used for loading JSON content files and manifest. All requests are same-origin (no CORS concerns).

### Optional Integrations

**Google AdSense**: Configuration file (`adsense-config.js`) exists but is disabled by default. Can be enabled by setting `enabled: true` and providing publisher/slot IDs. No actual integration currently active.

### Static Hosting Requirements

**GitHub Pages Compatibility**: Designed specifically for GitHub Pages deployment. Uses relative paths, no server-side routing, and handles direct file access patterns.

**No Build Process**: Application runs directly from source files with no compilation, bundling, or preprocessing required. Simplifies deployment and version control.

**SEO Optimization**: Includes `robots.txt` and sitemap references. Each page has proper meta descriptions and title tags for search engine indexing.

### Content Authoring

**No CMS Required**: Content creators add lessons by copying template JSON files, filling in data, and updating the manifest. No database, no admin panel, no authentication needed.

**Git-Based Workflow**: Content changes are committed to version control like code. Pull requests can be used for content review before publishing.

**Validation**: No formal validation system currently implemented, but JSON structure is self-documenting through templates and existing examples.