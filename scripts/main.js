// Hauptlogik der Anwendung
document.addEventListener('DOMContentLoaded', async () => {
    // Mobile Navigation umschalten
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Statistiken auf der Startseite laden und anzeigen
    if (document.getElementById('streak-count')) {
        await loadHomeStats();
    }

    // Service Worker registrieren
    if ('serviceWorker' in navigator) {
        try {
            const inPages = location.pathname.includes('/pages/');
            const swPath = inPages ? '../service-worker.js' : './service-worker.js';
            const swScope = inPages ? '../' : './';

            await navigator.serviceWorker.register(swPath, { scope: swScope });
            console.log('Service Worker registriert');
        } catch (error) {
            console.log('Service Worker Registrierung fehlgeschlagen:', error);
        }
    }
});

async function loadHomeStats() {
    try {
        // Lernserie (Streak)
        const streak = await db.getStreak();
        document.getElementById('streak-count').textContent = streak;

        // Anzahl abgeschlossener Lektionen
        const progress = await db.getAllProgress();
        const lessonsCompleted = progress.filter(p => p.completed).length;
        document.getElementById('lessons-completed').textContent = lessonsCompleted;

        // Gelerntes Vokabular
        const vocabulary = await db.getAllVocabulary();
        const vocabLearned = vocabulary.filter(v => v.learned).length;
        document.getElementById('vocab-learned').textContent = vocabLearned;
    } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
    }
}

// Hilfsfunktion zur Normalisierung deutscher Texte (Umlaute behandeln)
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

// Prüfen, ob zwei deutsche Wörter übereinstimmen (mit Umlaut-Toleranz)
function germanWordsMatch(answer, correct) {
    const normalizedAnswer = normalizeGerman(answer);
    const normalizedCorrect = normalizeGerman(correct);
    const directCorrect = correct.toLowerCase().trim();
    const directAnswer = answer.toLowerCase().trim();
    
    return directAnswer === directCorrect || normalizedAnswer === normalizedCorrect;
}

// Datum für Anzeige formatieren
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Prozentsatz des Fortschritts berechnen
function calculateCompletionPercentage(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}
