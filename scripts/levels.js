// Levels page logic
document.addEventListener('DOMContentLoaded', async () => {
    await loadLevels();
});

async function loadLevels() {
    const levelsGrid = document.getElementById('levels-grid');
    if (!levelsGrid) return;

    const levels = [
        {
            id: 'A1',
            name: 'A1 - Beginner',
            description: 'Start your German journey. Learn basic phrases, introduce yourself, and handle simple everyday situations.',
            lessons: []
        },
        {
            id: 'A2',
            name: 'A2 - Elementary',
            description: 'Build on basics. Discuss familiar topics, describe experiences, and understand common phrases.',
            lessons: []
        },
        {
            id: 'B1',
            name: 'B1 - Intermediate',
            description: 'Handle most travel situations. Describe experiences, dreams, and explain opinions on familiar matters.',
            lessons: []
        },
        {
            id: 'B2',
            name: 'B2 - Upper Intermediate',
            description: 'Understand complex texts. Interact fluently with native speakers and express yourself clearly on many topics.',
            lessons: []
        },
        {
            id: 'C1',
            name: 'C1 - Advanced',
            description: 'Express yourself fluently. Understand demanding texts and use the language effectively for social, academic, and professional purposes.',
            lessons: []
        }
    ];

    // Load lesson count and progress for each level
    const manifest = await loadManifest();
    const allProgress = await db.getAllProgress();

    for (const level of levels) {
        const levelLessons = manifest.lessons.filter(l => l.level === level.id);
        level.lessons = levelLessons;
        
        const completed = levelLessons.filter(lesson => {
            const progress = allProgress.find(p => p.id === lesson.id);
            return progress && progress.completed;
        }).length;

        const percentage = levelLessons.length > 0 
            ? Math.round((completed / levelLessons.length) * 100) 
            : 0;

        const card = document.createElement('a');
        card.href = `library.html?level=${level.id}`;
        card.className = 'level-card';
        card.innerHTML = `
            <span class="level-badge">${level.id}</span>
            <h3>${level.name}</h3>
            <p>${level.description}</p>
            <div class="level-progress-bar">
                <div class="level-progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="level-stats">
                <span>${completed} / ${levelLessons.length} lessons</span>
                <span>${percentage}% complete</span>
            </div>
        `;
        
        levelsGrid.appendChild(card);
    }
}

async function loadManifest() {
    try {
        const response = await fetch('../content/manifest.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading manifest:', error);
        return { lessons: [] };
    }
}
