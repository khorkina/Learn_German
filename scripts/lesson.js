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
    
    // Найти первую незавершённую лекцию
    let nextLesson = manifest.lessons.find(lesson => {
        const progress = allProgress.find(p => p.id === lesson.id);
        return !progress || !progress.completed;
    });
    
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
        document.getElementById('lesson-number').textContent = `Lektion ${lesson.number}`;
        
        const contentDiv = document.getElementById('lesson-content');
        contentDiv.innerHTML = '';

        // === Lernziele (Цели урока) ===
        if (lessonData.goals) {
            const goalsSection = document.createElement('div');
            goalsSection.className = 'lesson-section';
            goalsSection.innerHTML = `
                <h2>Lernziele</h2>
                <ul class="goals-list">
                    ${lessonData.goals.map(g => `<li>${g}</li>`).join('')}
                </ul>
            `;
            contentDiv.appendChild(goalsSection);
        }

        // === Grammatik ===
        if (lessonData.grammar) {
            const grammarSection = document.createElement('div');
            grammarSection.className = 'lesson-section';
            grammarSection.innerHTML = `
                <h2>Grammatik</h2>
                ${lessonData.grammar.map(item => `
                    <h3>${item.topic}</h3>
                    <p>${item.explanation}</p>
                    ${(item.examples || []).map(ex => `
                        <div class="example-box">
                            <div class="example-german">${ex.german}</div>
                        </div>
                    `).join('')}
                `).join('')}
            `;
            contentDiv.appendChild(grammarSection);
        }

        // === Wortschatz ===
        if (lessonData.vocabulary) {
            const vocabSection = document.createElement('div');
            vocabSection.className = 'lesson-section';
            vocabSection.innerHTML = `
                <h2>Wortschatz</h2>
                <div class="vocab-list">
                    ${lessonData.vocabulary.map(word => `
                        <div class="vocab-item">
                            <span class="vocab-german">${word.german}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            contentDiv.appendChild(vocabSection);
        }

        // === Nützliche Ausdrücke ===
        if (lessonData.phrases) {
            const phrasesSection = document.createElement('div');
            phrasesSection.className = 'lesson-section';
            phrasesSection.innerHTML = `
                <h2>Nützliche Ausdrücke</h2>
                ${lessonData.phrases.map(phrase => `
                    <div class="example-box">
                        <div class="example-german">${phrase.german}</div>
                    </div>
                `).join('')}
            `;
            contentDiv.appendChild(phrasesSection);
        }

        // === Interleaved rendering: Sektionen + Medien + Übungen ===
        renderInterleaved(lessonData);

    } catch (error) {
        console.error('Error loading lesson content:', error);
        const contentDiv = document.getElementById('lesson-content');
        contentDiv.innerHTML = '<p>Fehler beim Laden der Lektion. Bitte versuche es erneut.</p>';
    }
}

// === Функция для рендера по темам ===
function renderInterleaved(lessonData) {
  const contentDiv = document.getElementById('lesson-content');

  const mapping = [
    { media: '01_meeting', exIds: ['1a','1b'] },
    { media: '02_family_calls', exIds: ['2a'] },
    { media: '03_greetings_triptych', exIds: ['3a','3b'] },
    { media: '04_world_map', exIds: ['4b','4c'] },
    { media: '05_alphabet_song', exIds: ['5a','5b'] },
    { media: '06_houses_cities', exIds: ['6a'] },
    { media: '07_kitchen_talk', exIds: ['7a'] },
    { media: '08_registration_form', exIds: ['8b','8c'] },
    { media: '09_w_questions', exIds: ['9b','9d'] },
    { media: '10_germany_map', exIds: ['10a','10d'] }
  ];

  const mediaByKey = Object.fromEntries((lessonData.media_plan || []).map(m => [m.key, m]));
  const exById = Object.fromEntries((lessonData.exercises || []).map(ex => [ex.id, ex]));

  (lessonData.sections || []).forEach((sec, idx) => {
    const map = mapping[idx] || {};
    const media = mediaByKey[map.media];
    const wrapper = document.createElement('section');
    wrapper.className = 'lesson-section interleaved';

    wrapper.innerHTML = `
      <h2>${sec.title}</h2>
      <p>${sec.task || ''}</p>
    `;

    // Картинка темы
    if (media) {
      const fig = document.createElement('figure');
      fig.className = 'media-item';
      const src = `../img/lesson1/${media.key}.webp`;
      fig.innerHTML = `
        <img src="${src}" alt="${media.alt}" loading="lazy">
        <figcaption>${media.alt}</figcaption>
      `;
      wrapper.appendChild(fig);
    }

    // Упражнения
    const exWrap = document.createElement('div');
    exWrap.className = 'exercise-group';
    (map.exIds || []).forEach(id => {
      const ex = exById[id];
      if (!ex) return;
      const box = document.createElement('article');
      box.className = `exercise exercise-${ex.type}`;
      box.innerHTML = `
        <h4>${ex.id}. ${ex.title}</h4>
        ${ex.instructions ? `<p>${ex.instructions}</p>` : ''}
        ${renderExerciseBody(ex)}
      `;
      exWrap.appendChild(box);
    });
    wrapper.appendChild(exWrap);
    contentDiv.appendChild(wrapper);
  });

  // убираем старый блок “Illustrationen”, если где-то отрисовался
  document.querySelectorAll('.lesson-section h2').forEach(h => {
    if (h.textContent.trim() === 'Illustrationen') {
      h.closest('.lesson-section')?.remove();
    }
  });
}

// === Вспомогательная функция для отображения упражнений ===
function renderExerciseBody(ex) {
    if (ex.type === 'dialogue' && ex.dialogue) {
        return `<div>${ex.dialogue.map(d => `<p>• ${d.german}</p>`).join('')}</div>`;
    }
    if (ex.type === 'order' && ex.sets) {
        return ex.sets.map((set, i) =>
            `<div><strong>Satzfolge ${i+1}:</strong><ol>${
                set.map(s => `<li>${s}</li>`).join('')
            }</ol></div>`).join('');
    }
    if (ex.type === 'fill-in' && ex.items) {
        return `<ul>${ex.items.map(it => `<li>${it.question}</li>`).join('')}</ul>`;
    }
    if (ex.type === 'table-map' && ex.table) {
        return `<table class="ex-table"><thead><tr><th>Name</th><th>Land</th><th>Stadt</th></tr></thead>
        <tbody>${ex.table.map(r => `<tr><td>${r.Name}</td><td>${r.Land}</td><td>${r.Stadt}</td></tr>`).join('')}</tbody></table>`;
    }
    if (ex.type === 'numbers') {
        return `<p>${ex.numbers.join(' · ')}</p>`;
    }
    if (ex.type === 'question-build' && ex.prompts) {
        return `<ul>${ex.prompts.map(p => `<li>${p}</li>`).join('')}</ul>`;
    }
    if (ex.type === 'regional-farewells' && ex.pairs) {
        return `<ul>${ex.pairs.map(p => `<li>${p.phrase} → ${p.stadt}</li>`).join('')}</ul>`;
    }
    return '';
}

// === Вспомогательные функции ===
async function completeLesson() {
    if (!currentLesson) return;
    
    await db.saveProgress(currentLesson.id, {
        completed: true,
        completedAt: Date.now()
    });
    
    await db.updateStreak();
    
    const response = await fetch(`../content/${currentLesson.level}/${currentLesson.file}`);
    const lessonData = await response.json();
    
    if (lessonData.vocabulary) {
        for (const word of lessonData.vocabulary) {
            const vocabId = `${currentLesson.id}_${word.german}`;
            const existing = await db.getVocabulary(vocabId);
            if (existing) {
                await db.saveVocabulary({ ...existing, learned: true });
            }
        }
    }
    
    alert('Lektion abgeschlossen! Gut gemacht!');
    window.location.href = 'daily-lesson.html';
}

function showNoLessons() {
    document.getElementById('lesson-title').textContent = 'Keine Lektionen verfügbar';
    document.getElementById('lesson-content').innerHTML = '<p>Schau bald wieder vorbei für neue Lektionen!</p>';
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
