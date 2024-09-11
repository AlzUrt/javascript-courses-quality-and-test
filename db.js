const sqlite3 = require('sqlite3').verbose();

class DatabaseManager {
    constructor() {
        this.db = new sqlite3.Database('./hangman.db', (err) => {
            if (err) {
                console.error('Error opening database', err);
            } else {
                console.log('Database connected');
            }
        });
    }

    async initDatabase() {
        await this.createTables();
        await this.setWordOfTheDay();
    }

    createTables() {
        return new Promise((resolve, reject) => {
            this.db.run(`CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pseudo TEXT,
                score INTEGER,
                word TEXT
            )`, (err) => {
                if (err) reject(err);
                else {
                    this.db.run(`CREATE TABLE IF NOT EXISTS word_of_the_day (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        word TEXT,
                        date TEXT
                    )`, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                }
            });
        });
    }

    setWordOfTheDay() {
        return new Promise((resolve, reject) => {
            const today = new Date().toISOString().split('T')[0];
            this.db.get("SELECT word FROM word_of_the_day WHERE date = ?", [today], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(row.word);
                } else {
                    // Si pas de mot pour aujourd'hui, en choisir un nouveau
                    this.db.get("SELECT word FROM scores ORDER BY RANDOM() LIMIT 1", [], (err, row) => {
                        if (err) {
                            reject(err);
                        } else if (row) {
                            const newWord = row.word;
                            this.db.run("INSERT INTO word_of_the_day (word, date) VALUES (?, ?)", [newWord, today], (err) => {
                                if (err) reject(err);
                                else resolve(newWord);
                            });
                        } else {
                            // Si pas de mots dans la base, utiliser un mot par défaut
                            const defaultWord = "hangman";
                            this.db.run("INSERT INTO word_of_the_day (word, date) VALUES (?, ?)", [defaultWord, today], (err) => {
                                if (err) reject(err);
                                else resolve(defaultWord);
                            });
                        }
                    });
                }
            });
        });
    }

    getWordOfTheDay() {
        return new Promise((resolve, reject) => {
            const today = new Date().toISOString().split('T')[0];
            this.db.get("SELECT word FROM word_of_the_day WHERE date = ?", [today], (err, row) => {
                if (err) reject(err);
                else if (row) resolve(row.word);
                else this.setWordOfTheDay().then(resolve).catch(reject);
            });
        });
    }

    saveScore(pseudo, score, word) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO scores (pseudo, score, word) VALUES (?, ?, ?)`;
            this.db.run(query, [pseudo, score, word], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    getTopScores(limit = 1000) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM scores ORDER BY score DESC LIMIT ?`;
            this.db.all(query, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = new DatabaseManager();