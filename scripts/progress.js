// Progress page logic
document.addEventListener('DOMContentLoaded', async () => {
    await loadProgressData();
});

async function loadProgressData() {
    // Load streak
    const streak = await db.getStreak();
    document.getElementById('streak-days').textContent = streak;
    
    // Load lesson progress
    const allProgress = await db.getAllProgress();
    const completedLessons = allProgress.filter(p => p.completed);
    document.getElementById('total-lessons').textContent = completedLessons.length;
    
    // Load vocabulary
    const allVocab = await db.getAllVocabulary();
    const learnedVocab = allVocab.filter(v => v.learned);
    document.getElementById('total-vocab').textContent = learnedVocab.length;
    
    // Calculate exercise accuracy (placeholder)
    document.getElementById('exercise-accuracy').textContent = '—';
    
    // Load level progress
    await loadLevelProgress();
    
    // Load recent activity
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
                <span>${completed} / ${levelLessons.length} lessons completed</span>
            </div>
        `;
        
        levelProgressDiv.appendChild(item);
    }
}

async function loadRecentActivity() {
    const allProgress = await db.getAllProgress();
    const manifest = await loadManifest();
    const activityDiv = document.getElementById('recent-activity-list');
    
    // Sort by timestamp, most recent first
    const recentProgress = allProgress
        .filter(p => p.completed)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    
    if (recentProgress.length === 0) {
        activityDiv.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-lg);">No activity yet. Complete your first lesson to get started!</p>';
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
                    Completed <strong>${lesson.title}</strong>
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
        console.error('Error loading manifest:', error);
        return { lessons: [] };
    }
}
