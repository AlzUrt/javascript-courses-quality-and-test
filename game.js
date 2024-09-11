const tools = require('./tools.js');
const db = require('./db.js');

class Game {
    constructor(state) {
        if (state) {
            this.word = state.word;
            this.unknowWord = state.unknowWord;
            this.numberOfTry = state.numberOfTry;
            this.score = state.score;
            this.startTime = state.startTime;
            this.endTime = state.endTime;
            this.pseudo = state.pseudo;
            this.isScoreSubmitted = state.isScoreSubmitted;
            this.guessedLetters = new Set(state.guessedLetters);
        } else {
            throw new Error("Game state is required");
        }
    }

    getState() {
        return {
            word: this.word,
            unknowWord: this.unknowWord,
            numberOfTry: this.numberOfTry,
            score: this.score,
            startTime: this.startTime,
            endTime: this.endTime,
            pseudo: this.pseudo,
            isScoreSubmitted: this.isScoreSubmitted,
            guessedLetters: Array.from(this.guessedLetters)
        };
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

    setPseudo(pseudo) {
        this.pseudo = pseudo;
    }

    getGuessedLetters() {
        return Array.from(this.guessedLetters).sort().join(', ');
    }

    async saveScore(finalScore) {
        if (this.isGameWon() && this.pseudo && !this.isScoreSubmitted) {
            await db.saveScore(this.pseudo, finalScore, this.word);
            this.isScoreSubmitted = true;
        }
    }

    reset(newWord) {
        this.word = newWord.toLowerCase();
        this.unknowWord = this.word.replace(/./g, '#');
        this.numberOfTry = 5;
        this.score = 1000;
        this.startTime = Date.now();
        this.endTime = null;
        this.pseudo = '';
        this.isScoreSubmitted = false;
        this.guessedLetters.clear();
    }
}

module.exports = Game;