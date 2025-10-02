// IndexedDB wrapper with localStorage fallback
const DB_NAME = 'LearnGermanDB';
const DB_VERSION = 1;
const STORES = {
    PROGRESS: 'progress',
    VOCABULARY: 'vocabulary',
    EXERCISES: 'exercises',
    SETTINGS: 'settings',
    STREAKS: 'streaks'
};

class DatabaseManager {
    constructor() {
        this.db = null;
        this.useIndexedDB = true;
        this.ready = this.init();
    }

    async init() {
        try {
            if (!window.indexedDB) {
                console.warn('IndexedDB not available, falling back to localStorage');
                this.useIndexedDB = false;
                return;
            }

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = () => {
                    console.warn('IndexedDB error, falling back to localStorage');
                    this.useIndexedDB = false;
                    resolve();
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve();
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;

                    // Create object stores
                    if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
                        db.createObjectStore(STORES.PROGRESS, { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains(STORES.VOCABULARY)) {
                        const vocabStore = db.createObjectStore(STORES.VOCABULARY, { keyPath: 'id' });
                        vocabStore.createIndex('level', 'level', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.EXERCISES)) {
                        db.createObjectStore(STORES.EXERCISES, { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                    }
                    if (!db.objectStoreNames.contains(STORES.STREAKS)) {
                        db.createObjectStore(STORES.STREAKS, { keyPath: 'id' });
                    }
                };
            });
        } catch (error) {
            console.error('Database initialization error:', error);
            this.useIndexedDB = false;
        }
    }

    // Generic get/set methods
    async get(storeName, key) {
        await this.ready;
        
        if (!this.useIndexedDB) {
            return this._localStorageGet(storeName, key);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async set(storeName, data) {
        await this.ready;
        
        if (!this.useIndexedDB) {
            return this._localStorageSet(storeName, data);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        await this.ready;
        
        if (!this.useIndexedDB) {
            return this._localStorageGetAll(storeName);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // LocalStorage fallback methods
    _localStorageGet(storeName, key) {
        try {
            const data = localStorage.getItem(`${DB_NAME}_${storeName}_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('localStorage get error:', error);
            return null;
        }
    }

    _localStorageSet(storeName, data) {
        try {
            const key = data.id || data.key;
            localStorage.setItem(`${DB_NAME}_${storeName}_${key}`, JSON.stringify(data));
            return Promise.resolve();
        } catch (error) {
            console.error('localStorage set error:', error);
            return Promise.reject(error);
        }
    }

    _localStorageGetAll(storeName) {
        try {
            const prefix = `${DB_NAME}_${storeName}_`;
            const results = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    const data = localStorage.getItem(key);
                    results.push(JSON.parse(data));
                }
            }
            return Promise.resolve(results);
        } catch (error) {
            console.error('localStorage getAll error:', error);
            return Promise.resolve([]);
        }
    }

    // Progress methods
    async saveProgress(lessonId, data) {
        const progress = {
            id: lessonId,
            ...data,
            timestamp: Date.now()
        };
        return this.set(STORES.PROGRESS, progress);
    }

    async getProgress(lessonId) {
        return this.get(STORES.PROGRESS, lessonId);
    }

    async getAllProgress() {
        return this.getAll(STORES.PROGRESS);
    }

    // Vocabulary methods
    async saveVocabulary(vocab) {
        return this.set(STORES.VOCABULARY, vocab);
    }

    async getVocabulary(vocabId) {
        return this.get(STORES.VOCABULARY, vocabId);
    }

    async getAllVocabulary() {
        return this.getAll(STORES.VOCABULARY);
    }

    // Exercise methods
    async saveExerciseResult(exerciseId, result) {
        const data = {
            id: exerciseId,
            ...result,
            timestamp: Date.now()
        };
        return this.set(STORES.EXERCISES, data);
    }

    async getExerciseResult(exerciseId) {
        return this.get(STORES.EXERCISES, exerciseId);
    }

    // Settings methods
    async saveSetting(key, value) {
        return this.set(STORES.SETTINGS, { key, value });
    }

    async getSetting(key) {
        const result = await this.get(STORES.SETTINGS, key);
        return result ? result.value : null;
    }

    // Streak methods
    async updateStreak() {
        const today = new Date().toDateString();
        const streakData = await this.get(STORES.STREAKS, 'current') || {
            id: 'current',
            count: 0,
            lastDate: null
        };

        if (streakData.lastDate === today) {
            return streakData.count;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (streakData.lastDate === yesterdayStr) {
            streakData.count += 1;
        } else if (streakData.lastDate !== today) {
            streakData.count = 1;
        }

        streakData.lastDate = today;
        await this.set(STORES.STREAKS, streakData);
        return streakData.count;
    }

    async getStreak() {
        const streakData = await this.get(STORES.STREAKS, 'current');
        return streakData ? streakData.count : 0;
    }
}

// Initialize global database instance
const db = new DatabaseManager();
