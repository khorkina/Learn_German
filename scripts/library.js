// Library page logic
document.addEventListener('DOMContentLoaded', async () => {
    await loadLibrary();
    
    const levelFilter = document.getElementById('level-filter');
    if (levelFilter) {
        levelFilter.addEventListener('change', filterLibrary);
        
        // Set filter from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('level');
        if (level) {
            levelFilter.value = level;
        }
    }
    
    await filterLibrary();
});

let allLessons = [];

async function loadLibrary() {
    const manifest = await loadManifest();
    allLessons = manifest.lessons;
}

async function filterLibrary() {
    const levelFilter = document.getElementById('level-filter');
    const selectedLevel = levelFilter ? levelFilter.value : 'all';
    
    const filteredLessons = selectedLevel === 'all' 
        ? allLessons 
        : allLessons.filter(l => l.level === selectedLevel);
    
    await displayLessons(filteredLessons);
}

async function displayLessons(lessons) {
    const libraryGrid = document.getElementById('library-grid');
    if (!libraryGrid) return;
    
    libraryGrid.innerHTML = '';
    
    if (lessons.length === 0) {
        libraryGrid.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No lessons available for this level yet.</p>';
        return;
    }
    
    const allProgress = await db.getAllProgress();
    
    for (const lesson of lessons) {
        const progress = allProgress.find(p => p.id === lesson.id);
        const isCompleted = progress && progress.completed;
        
        const item = document.createElement('a');
        item.href = `daily-lesson.html?id=${lesson.id}`;
        item.className = 'library-item';
        item.innerHTML = `
            <div class="library-item-header">
                <h3>${lesson.title}</h3>
                ${isCompleted ? '<span class="completion-badge">✓ Completed</span>' : ''}
            </div>
            <p>
                <span class="level-badge">${lesson.level}</span>
                Lesson ${lesson.number}
                ${lesson.description ? ` - ${lesson.description}` : ''}
            </p>
        `;
        
        libraryGrid.appendChild(item);
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
