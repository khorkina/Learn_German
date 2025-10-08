// Exercises page logic
let currentExercises = [];
let currentQuestionIndex = 0;
let score = 0;

// ⬇️ НОВОЕ: запоминаем, из какой лекции запущены упражнения
let currentLesson = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadExerciseList();
});

async function loadExerciseList() {
    const manifest = await loadManifest();
    const exerciseList = document.getElementById('exercise-list');
    
    if (!exerciseList) return;
    
    exerciseList.innerHTML = '';
    
    for (const lesson of manifest.lessons) {
        if (lesson.exercisesFile) {
            const option = document.createElement('div');
            option.className = 'exercise-option';
            option.innerHTML = `
                <h3>${lesson.title}</h3>
                <p>${lesson.level} - Lektion ${lesson.number}</p>
            `;
            option.addEventListener('click', () => loadExercises(lesson));
            exerciseList.appendChild(option);
        }
    }
}

async function loadExercises(lesson) {
    try {
        // ⬇️ НОВОЕ: сохраняем текущую лекцию
        currentLesson = lesson;

        const response = await fetch(`../content/${lesson.level}/${lesson.exercisesFile}`);
        currentExercises = await response.json();
        currentQuestionIndex = 0;
        score = 0;
        
        document.getElementById('exercise-title').textContent = `${lesson.title} - Übungen`;
        document.getElementById('total-questions').textContent = currentExercises.length;
        
        showQuestion();
    } catch (error) {
        console.error('Error loading exercises:', error);
        alert('Fehler beim Laden der Übungen. Bitte versuche es erneut.');
    }
}

function showQuestion() {
    if (currentQuestionIndex >= currentExercises.length) {
        showResults();
        return;
    }
    
    const exercise = currentExercises[currentQuestionIndex];
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    
    const contentDiv = document.getElementById('exercise-content');
    const feedbackDiv = document.getElementById('exercise-feedback');
    const actionsDiv = document.getElementById('exercise-actions');
    
    feedbackDiv.className = 'exercise-feedback';
    feedbackDiv.innerHTML = '';
    
    contentDiv.innerHTML = `<div class="exercise-question">${exercise.question}</div>`;
    
    if (exercise.type === 'fill-in') {
        contentDiv.innerHTML += `
            <input type="text" 
                   class="exercise-input" 
                   id="answer-input" 
                   placeholder="Antwort eingeben..."
                   autocomplete="off">
        `;
        
        actionsDiv.innerHTML = `
            <button class="btn btn-primary" onclick="checkAnswer()">Antwort prüfen</button>
        `;
        
        setTimeout(() => {
            const input = document.getElementById('answer-input');
            if (input) {
                input.focus();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') checkAnswer();
                });
            }
        }, 100);
        
    } else if (exercise.type === 'multiple-choice') {
        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'exercise-choices';
        
        exercise.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = option;
            button.onclick = () => selectChoice(button, index);
            choicesDiv.appendChild(button);
        });
        
        contentDiv.appendChild(choicesDiv);
        
        actionsDiv.innerHTML = `
            <button class="btn btn-primary" onclick="checkMultipleChoice()">Antwort prüfen</button>
        `;
    }
}

let selectedChoiceIndex = null;

function selectChoice(button, index) {
    document.querySelectorAll('.choice-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
    selectedChoiceIndex = index;
}

function checkAnswer() {
    const input = document.getElementById('answer-input');
    if (!input) return;
    
    const userAnswer = input.value.trim();
    const exercise = currentExercises[currentQuestionIndex];
    const feedbackDiv = document.getElementById('exercise-feedback');
    
    const isCorrect = germanWordsMatch(userAnswer, exercise.answer);
    
    feedbackDiv.classList.add('show');
    
    if (isCorrect) {
        score++;
        feedbackDiv.className = 'exercise-feedback show correct';
        feedbackDiv.innerHTML = '✓ Richtig! ' + (exercise.explanation || '');
    } else {
        feedbackDiv.className = 'exercise-feedback show incorrect';
        feedbackDiv.innerHTML = `✗ Falsch. Die richtige Antwort ist: <strong>${exercise.answer}</strong>` + 
            (exercise.explanation ? `<br>${exercise.explanation}` : '');
    }
    
    const actionsDiv = document.getElementById('exercise-actions');
    actionsDiv.innerHTML = `
        <button class="btn btn-primary" onclick="nextQuestion()">Nächste Frage</button>
    `;
}

function checkMultipleChoice() {
    if (selectedChoiceIndex === null) {
        alert('Bitte wähle zuerst eine Antwort aus.');
        return;
    }
    
    const exercise = currentExercises[currentQuestionIndex];
    const feedbackDiv = document.getElementById('exercise-feedback');
    const isCorrect = selectedChoiceIndex === exercise.correctIndex;
    
    feedbackDiv.classList.add('show');
    
    if (isCorrect) {
        score++;
        feedbackDiv.className = 'exercise-feedback show correct';
        feedbackDiv.innerHTML = '✓ Richtig! ' + (exercise.explanation || '');
    } else {
        feedbackDiv.className = 'exercise-feedback show incorrect';
        feedbackDiv.innerHTML = `✗ Falsch. Die richtige Antwort ist: <strong>${exercise.options[exercise.correctIndex]}</strong>` + 
            (exercise.explanation ? `<br>${exercise.explanation}` : '');
    }
    
    const actionsDiv = document.getElementById('exercise-actions');
    actionsDiv.innerHTML = `
        <button class="btn btn-primary" onclick="nextQuestion()">Nächste Frage</button>
    `;
}

function nextQuestion() {
    currentQuestionIndex++;
    selectedChoiceIndex = null;
    showQuestion();
}

async function showResults() {
    const percentage = Math.round((score / currentExercises.length) * 100);
    const contentDiv = document.getElementById('exercise-content');
    const actionsDiv = document.getElementById('exercise-actions');

    // ⬇️ НОВОЕ: сохраняем результат попытки в IndexedDB
    try {
        await db.saveExerciseResult(
            `${(currentLesson && currentLesson.id) ? currentLesson.id : 'unknown'}_${Date.now()}`,
            {
                lessonId: currentLesson ? currentLesson.id : null,
                correct: score,
                total: currentExercises.length,
                accuracy: percentage
            }
        );
    } catch (e) {
        console.error('Fehler beim Speichern des Übungsergebnisses:', e);
    }
    
    contentDiv.innerHTML = `
        <div style="text-align: center; padding: var(--space-2xl);">
            <h2>Übung abgeschlossen!</h2>
            <div class="stat-value">${score} / ${currentExercises.length}</div>
            <p style="font-size: var(--font-size-lg); margin-top: var(--space-md);">
                Dein Ergebnis: ${percentage}%
            </p>
        </div>
    `;
    
    actionsDiv.innerHTML = `
        <button class="btn btn-primary" onclick="location.reload()">Weitere Übung starten</button>
        <a href="progress.html" class="btn btn-secondary">Fortschritt anzeigen</a>
    `;
    
    document.getElementById('exercise-feedback').className = 'exercise-feedback';
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
