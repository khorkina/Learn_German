// Fortschrittsseite Logik
document.addEventListener('DOMContentLoaded', async () => {
    await loadProgressData();
});

async function loadProgressData() {
    // Lernserie (Streak)
    const streak = await db.getStreak();
    document.getElementById('streak-days').textContent = streak;
    
    // Lektionen-Fortschritt
    const allProgress = await db.getAllProgress();
    const completedLessons = allProgress.filter(p => p.completed);
    document.getElementById('total-lessons').textContent = completedLessons.length;
    
    // Vokabular laden
    const allVocab = await db.getAllVocabulary();
    const learnedVocab = allVocab.filter(v => v.learned);
    document.getElementById('total-vocab').textContent = learnedVocab.length;
    
    // ⬇️ NEU: Übungsgenauigkeit berechnen (Durchschnitt über alle Versuche)
    try {
        const exerciseResults = await db.getAll('exercises'); // liest alle gespeicherten Übungsergebnisse
        if (exerciseResults.length > 0) {
            const avg = Math.round(
                exerciseResults.reduce((sum, r) => sum + (Number(r.accuracy) || 0), 0) / exerciseResults.length
            );
            document.getElementById('exercise-accuracy').textContent = `${avg}%`;
        } else {
            document.getElementById('exercise-accuracy').textContent = '—';
        }
    } catch (e) {
        console.error('Fehler beim Laden der Übungsergebnisse:', e);
        document.getElementById('exercise-accuracy').textContent = '—';
    }
    
    // Fortschritt nach Niveau laden
    await loadLevelProgress();
    
    // Letzte Aktivitäten laden
    await loadRecentActivity();
}

async function loadLevelProgress() {
    const manifest = await loadManifest();
    const allProgress = await db.getAllProgress();
    const levelProgressDiv = document.getElementById('level-progress-list');
    
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    
    for (const level of levels) {
        const levelLessons = manifest.lessons.filter(l => l.level === level);
        if (levelLessons.length === 0) continue;
        
        const completed = levelLessons.filter(lesson => {
            const progress = allProgress.find(p => p.id === lesson.id);
            return progress && progress.completed;
        }).length;
        
        const percentage = Math.round((completed / levelLessons.length) * 100);
        
        const item = document.createElement('div');
        item.className = 'progress-item';
        item.innerHTML = `
            <div class="progress-item-header">
                <span class="progress-item-title">${level}</span>
                <span class="progress-item-percentage">${percentage}%</span>
            </div>
            <div class="level-progress-bar">
                <div class="level-progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="level-stats">
                <span>${completed} / ${levelLessons.length} Lektionen abgeschlossen</span>
            </div>
        `;
        
        levelProgressDiv.appendChild(item);
    }
}

async function loadRecentActivity() {
    const allProgress = await db.getAllProgress();
    const manifest = await loadManifest();
    const activityDiv = document.getElementById('recent-activity-list');
    
    // Nach Zeitstempel sortieren (neueste zuerst)
    const recentProgress = allProgress
        .filter(p => p.completed)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    
    if (recentProgress.length === 0) {
        activityDiv.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-lg);">Noch keine Aktivitäten. Schließe deine erste Lektion ab, um zu beginnen!</p>';
        return;
    }
    
    for (const progress of recentProgress) {
        const lesson = manifest.lessons.find(l => l.id === progress.id);
        if (!lesson) continue;
        
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div>
                <div class="activity-description">
                    Abgeschlossen: <strong>${lesson.title}</strong>
                </div>
                <div class="activity-date">${formatDate(progress.timestamp)}</div>
            </div>
            <span class="level-badge">${lesson.level}</span>
        `;
        
        activityDiv.appendChild(item);
    }
}

async function loadManifest() {
    try {
        const response = await fetch('../content/manifest.json');
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Laden des Manifests:', error);
        return { lessons: [] };
    }
}
