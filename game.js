const tools = require('./tools.js');
const csv = require('csv-parser');
const fs = require('fs');

class Game {
    constructor() {
        this.listOfWords = [];
        this.numberOfTry = 5;
        this.score = 1000;
        this.startTime = Date.now();
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

    chooseWord() {
        if (this.listOfWords.length > 0) {
            this.word = this.listOfWords[tools.getRandomInt(this.listOfWords.length)];
            this.unknowWord = this.word.replace(/./g, '#');
        } else {
            throw new Error("No words available to choose from.");
        }
    }

    guess(oneLetter) {
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
            this.numberOfTry--;
            this.score = Math.max(0, this.score - 50);
        }
        return found;
    }


    print() {
        return this.unknowWord;
    }

    getNumberOfTries() {
        return this.numberOfTry;
    }

    reset() {
        this.numberOfTry = 5;
        this.chooseWord();
        this.score = 1000;
        this.startTime = Date.now();
        return this.numberOfTry;
    }

    getScore() {
        const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        return Math.max(0, this.score - elapsedSeconds);
    }

}

module.exports = Game;
