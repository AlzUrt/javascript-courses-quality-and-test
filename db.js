const sqlite3 = require('sqlite3').verbose();

class DatabaseManager {
    constructor() {
        this.db = new sqlite3.Database('./hangman.db', (err) => {
            if (err) {
                console.error('Error opening database', err);
            } else {
                console.log('Database connected');
                this.initDatabase();
            }
        });
    }

    initDatabase() {
        this.db.run(`CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pseudo TEXT,
            score INTEGER,
            word TEXT
        )`);
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