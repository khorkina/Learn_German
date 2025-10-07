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
            name: 'A1 - Anfänger',
            description: 'Starte deine Deutschreise. Lerne grundlegende Redemittel, stelle dich vor und meistere einfache Alltagssituationen.',
            lessons: []
        },
        {
            id: 'A2',
            name: 'A2 - Grundstufe',
            description: 'Baue auf den Grundlagen auf. Sprich über vertraute Themen, beschreibe Erfahrungen und verstehe häufige Wendungen.',
            lessons: []
        },
        {
            id: 'B1',
            name: 'B1 - Mittelstufe',
            description: 'Bewältige die meisten Reisesituationen. Beschreibe Erfahrungen und Träume und begründe Meinungen zu vertrauten Themen.',
            lessons: []
        },
        {
            id: 'B2',
            name: 'B2 - Obere Mittelstufe',
            description: 'Verstehe komplexe Texte. Unterhalte dich flüssig mit Muttersprachlern und drücke dich klar zu vielen Themen aus.',
            lessons: []
        },
        {
            id: 'C1',
            name: 'C1 - Fortgeschritten',
            description: 'Drücke dich fließend aus. Verstehe anspruchsvolle Texte und nutze die Sprache sicher in sozialen, akademischen und beruflichen Kontexten.',
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
                <span>${completed} / ${levelLessons.length} Lektionen</span>
                <span>${percentage}% abgeschlossen</span>
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
