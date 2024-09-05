const tools = require('./tools.js');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('./db.js');

class Game {
    constructor() {
        //insert word in the list
        this.listOfWords = [];
        this.numberOfTry = 5;
        this.score = 1000;
        this.startTime = Date.now();
        this.endTime = null;
        this.pseudo = '';
        this.isScoreSubmitted = false;
        this.word = '';
        this.unknowWord = '';
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
            this.unknowWord = this.word.replace(/./g, '#');
        } else {
            throw new Error("No words available to choose from.");
        }
    }

    guess(oneLetter) {
        if (this.isGameOver()) {
            return false;
        }

        if (!this.word) {
            throw new Error("The word has not been set. Please ensure that the game has been initialized properly.");
        }

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
        if (this.endTime) {
            const elapsedSeconds = Math.floor((this.endTime - this.startTime) / 1000);
            return Math.max(0, this.score - elapsedSeconds);
        } else {
            const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            return Math.max(0, this.score - elapsedSeconds);
        }
    }

    isGameOver() {
        return this.numberOfTry === 0 || this.unknowWord === this.word;
    }

    isGameWon() {
        return this.unknowWord === this.word;
    }

    async saveScore() {
        if (this.isGameWon() && this.pseudo && !this.isScoreSubmitted) {
            await db.saveScore(this.pseudo, this.getScore(), this.word);
            this.isScoreSubmitted = true;
        }
    }

    setPseudo(pseudo) {
        this.pseudo = pseudo;
    }

    reset() {
        this.numberOfTry = 5;
        this.chooseWord();
        this.score = 1000;
        this.startTime = Date.now();
        this.endTime = null;
        this.pseudo = '';
        this.isScoreSubmitted = false;
        return this.numberOfTry;
    }

}

module.exports = Game;
