// Main application logic
document.addEventListener('DOMContentLoaded', async () => {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Load and display stats on homepage
    if (document.getElementById('streak-count')) {
        await loadHomeStats();
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./service-worker.js');
            console.log('Service Worker registered');
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
});

async function loadHomeStats() {
    try {
        // Get streak
        const streak = await db.getStreak();
        document.getElementById('streak-count').textContent = streak;

        // Get lessons completed
        const progress = await db.getAllProgress();
        const lessonsCompleted = progress.filter(p => p.completed).length;
        document.getElementById('lessons-completed').textContent = lessonsCompleted;

        // Get vocabulary learned
        const vocabulary = await db.getAllVocabulary();
        const vocabLearned = vocabulary.filter(v => v.learned).length;
        document.getElementById('vocab-learned').textContent = vocabLearned;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Utility function to normalize German text (handle umlauts)
function normalizeGerman(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss');
}

// Check if two German words match (with umlaut tolerance)
function germanWordsMatch(answer, correct) {
    const normalizedAnswer = normalizeGerman(answer);
    const normalizedCorrect = normalizeGerman(correct);
    const directCorrect = correct.toLowerCase().trim();
    const directAnswer = answer.toLowerCase().trim();
    
    return directAnswer === directCorrect || normalizedAnswer === normalizedCorrect;
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Calculate completion percentage
function calculateCompletionPercentage(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}
