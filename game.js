const tools = require('./tools.js');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('./db.js');

class Game {
    constructor() {
        this.listOfWords = [];
        this.numberOfTry = 5;
        this.score = 1000;
        this.startTime = Date.now();
        this.endTime = null;
        this.pseudo = '';
        this.isScoreSubmitted = false;
        this.guessedLetters = new Set();
    }

    loadWords() {
        return new Promise((resolve, reject) => {
            fs.createReadStream('words_fr.txt')
                .pipe(csv())
                .on('data', (row) => {
                    this.listOfWords.push(row.word.toLowerCase());
                })
                .on('end', () => {
                    console.log('CSV file successfully processed');
                    this.chooseWord();
                    resolve();
                })
                .on('error', reject);
        });
    }

    setWordList(words) {
        this.listOfWords = words;
    }

    chooseWord() {
        if (this.listOfWords.length > 0) {
            this.word = this.listOfWords[tools.getRandomInt(this.listOfWords.length)];
            console.log("Word : " + this.word);
            this.unknowWord = this.word.replace(/./g, '#');
        } else {
            throw new Error("No words available to choose from.");
        }
    }

    guess(oneLetter) {
        if (this.isGameOver()) {
            return false;
        }

        oneLetter = oneLetter.toLowerCase();
        this.guessedLetters.add(oneLetter);

        let found = false;
        for (let i = 0; i < this.word.length; i++) {
            if (this.word[i] === oneLetter) {
                this.unknowWord = tools.replaceAt(this.unknowWord, i, oneLetter);
                found = true;
            }
        }

        if (!found) {
            this.numberOfTry = Math.max(0, this.numberOfTry - 1);
            this.score = Math.max(0, this.score - 50);
        }

        if (this.isGameOver()) {
            this.endTime = Date.now();
        }

        return found;
    }


    print() {
        return this.unknowWord;
    }

    getNumberOfTries() {
        return this.numberOfTry;
    }

    getScore() {
        const elapsedSeconds = Math.floor((this.endTime || Date.now()) - this.startTime) / 1000;
        return Math.max(0, Math.floor(this.score - elapsedSeconds));
    }

    isGameOver() {
        return this.numberOfTry === 0 || this.unknowWord === this.word;
    }

    isGameWon() {
        return this.unknowWord === this.word;
    }

    async saveScore(finalScore) {
        if (this.isGameWon() && this.pseudo && !this.isScoreSubmitted) {
            await db.saveScore(this.pseudo, finalScore, this.word);
            this.isScoreSubmitted = true;
        }
    }

    setPseudo(pseudo) {
        this.pseudo = pseudo;
    }

    getGuessedLetters() {
        return Array.from(this.guessedLetters).sort().join(', ');
    }
    
    reset() {
        this.numberOfTry = 5;
        this.chooseWord();
        this.score = 1000;
        this.startTime = Date.now();
        this.endTime = null;
        this.pseudo = '';
        this.isScoreSubmitted = false;
        this.guessedLetters.clear();
        return this.numberOfTry;
    }

}

module.exports = Game;
