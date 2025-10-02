// Daily lesson page logic
let currentLesson = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadDailyLesson();
    
    const completeBtn = document.getElementById('complete-lesson');
    if (completeBtn) {
        completeBtn.addEventListener('click', completeLesson);
    }
});

async function loadDailyLesson() {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');
    
    if (lessonId) {
        await loadSpecificLesson(lessonId);
    } else {
        await loadNextLesson();
    }
}

async function loadNextLesson() {
    const manifest = await loadManifest();
    const allProgress = await db.getAllProgress();
    
    // Find first incomplete lesson
    let nextLesson = manifest.lessons.find(lesson => {
        const progress = allProgress.find(p => p.id === lesson.id);
        return !progress || !progress.completed;
    });
    
    // If all complete, show first lesson
    if (!nextLesson && manifest.lessons.length > 0) {
        nextLesson = manifest.lessons[0];
    }
    
    if (nextLesson) {
        await loadLessonContent(nextLesson);
    } else {
        showNoLessons();
    }
}

async function loadSpecificLesson(lessonId) {
    const manifest = await loadManifest();
    const lesson = manifest.lessons.find(l => l.id === lessonId);
    
    if (lesson) {
        await loadLessonContent(lesson);
    } else {
        showNoLessons();
    }
}

async function loadLessonContent(lesson) {
    currentLesson = lesson;
    
    try {
        const response = await fetch(`../content/${lesson.level}/${lesson.file}`);
        const lessonData = await response.json();
        
        document.getElementById('lesson-title').textContent = lessonData.title;
        document.getElementById('lesson-level').textContent = lesson.level;
        document.getElementById('lesson-number').textContent = `Lesson ${lesson.number}`;
        
        const contentDiv = document.getElementById('lesson-content');
        contentDiv.innerHTML = '';
        
        // Render grammar section
        if (lessonData.grammar) {
            const grammarSection = document.createElement('div');
            grammarSection.className = 'lesson-section';
            grammarSection.innerHTML = `
                <h2>Grammar</h2>
                ${lessonData.grammar.map(item => `
                    <h3>${item.topic}</h3>
                    <p>${item.explanation}</p>
                    ${item.examples ? item.examples.map(ex => `
                        <div class="example-box">
                            <div class="example-german">${ex.german}</div>
                            <div class="example-english">${ex.english}</div>
                        </div>
                    `).join('') : ''}
                `).join('')}
            `;
            contentDiv.appendChild(grammarSection);
        }
        
        // Render vocabulary section
        if (lessonData.vocabulary) {
            const vocabSection = document.createElement('div');
            vocabSection.className = 'lesson-section';
            vocabSection.innerHTML = `
                <h2>Vocabulary</h2>
                <div class="vocab-list">
                    ${lessonData.vocabulary.map(word => `
                        <div class="vocab-item">
                            <span class="vocab-german">${word.german}</span>
                            <span class="vocab-english">${word.english}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            contentDiv.appendChild(vocabSection);
            
            // Save vocabulary to database
            for (const word of lessonData.vocabulary) {
                await db.saveVocabulary({
                    id: `${lesson.id}_${word.german}`,
                    german: word.german,
                    english: word.english,
                    level: lesson.level,
                    lessonId: lesson.id,
                    learned: false
                });
            }
        }
        
        // Render phrases section
        if (lessonData.phrases) {
            const phrasesSection = document.createElement('div');
            phrasesSection.className = 'lesson-section';
            phrasesSection.innerHTML = `
                <h2>Useful Phrases</h2>
                ${lessonData.phrases.map(phrase => `
                    <div class="example-box">
                        <div class="example-german">${phrase.german}</div>
                        <div class="example-english">${phrase.english}</div>
                    </div>
                `).join('')}
            `;
            contentDiv.appendChild(phrasesSection);
        }
        
    } catch (error) {
        console.error('Error loading lesson content:', error);
        contentDiv.innerHTML = '<p>Error loading lesson. Please try again.</p>';
    }
}

async function completeLesson() {
    if (!currentLesson) return;
    
    await db.saveProgress(currentLesson.id, {
        completed: true,
        completedAt: Date.now()
    });
    
    await db.updateStreak();
    
    // Mark vocabulary as learned
    const response = await fetch(`../content/${currentLesson.level}/${currentLesson.file}`);
    const lessonData = await response.json();
    
    if (lessonData.vocabulary) {
        for (const word of lessonData.vocabulary) {
            const vocabId = `${currentLesson.id}_${word.german}`;
            const existing = await db.getVocabulary(vocabId);
            if (existing) {
                await db.saveVocabulary({
                    ...existing,
                    learned: true
                });
            }
        }
    }
    
    alert('Lesson completed! Great work!');
    window.location.href = 'daily-lesson.html';
}

function showNoLessons() {
    document.getElementById('lesson-title').textContent = 'No lessons available';
    document.getElementById('lesson-content').innerHTML = '<p>Check back soon for new lessons!</p>';
    document.getElementById('complete-lesson').style.display = 'none';
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
