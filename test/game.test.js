const Game = require('../game.js');
const db = require('../db');
const fs = require('fs');

jest.mock('../db', () => ({
    saveScore: jest.fn().mockResolvedValue(true),
    getTopScores: jest.fn().mockResolvedValue([])
}));

let game;
let initialState;

beforeEach(() => {
    jest.useFakeTimers();
    initialState = {
        word: 'damien',
        unknowWord: '######',
        numberOfTry: 5,
        score: 1000,
        startTime: Date.now(),
        endTime: null,
        pseudo: '',
        isScoreSubmitted: false,
        guessedLetters: []
    };
    game = new Game(initialState);
});

afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
});

describe("Game test", () => {

    test("The word must be 'damien'", () => {
        expect(game.word).toBe("damien");
    });

    test("should be 5 tries at the beginning of the game", () => {
        expect(game.getNumberOfTries()).toBe(5);
    });

    test("test the try mechanic with a correct guess", () => {
        game.guess("a");
        expect(game.getNumberOfTries()).toBe(5);
    });

    test("test the try mechanic with an incorrect guess", () => {
        game.guess("b");
        expect(game.getNumberOfTries()).toBe(4);
    });

    test("reset the game, so the number of tries should be 5", () => {
        game.reset("newword");
        expect(game.getNumberOfTries()).toBe(5);
    });

    test("number of tries shouldn't decrease under 0", () => {
        for (let i = 0; i < 10; i++) {
            game.guess("z");
        }
        expect(game.getNumberOfTries()).toBe(0);
    });

    test("should show only 'a' letter", () => {
        game.guess("a");
        expect(game.print()).toBe("#a####");
    });

    test("should show all occurrences of a letter", () => {
        game = new Game({...initialState, word: 'carafe', unknowWord: '######'});
        game.guess("a");
        expect(game.print()).toBe("#a#a##");
    });

    describe("Score test", () => {
        test("reset should set score back to 1000", () => {
            game.reset("newword");
            expect(game.getScore()).toBe(1000);
        });

        test("score should decrease over time", () => {
            const initialScore = game.getScore();
            
            jest.advanceTimersByTime(2000);
            
            const newScore = game.getScore();
            expect(newScore).toBeLessThan(initialScore);
            expect(newScore).toBeGreaterThanOrEqual(initialScore - 3); 
        });

        test("score should decrease by 50 points for incorrect guess", () => {
            const initialScore = game.getScore();
            game.guess('z');
            expect(game.getScore()).toBe(initialScore - 50);
        });

        test("score should not decrease below 0", () => {
            game = new Game({...initialState, score: 30});
            game.guess('z');
            expect(game.getScore()).toBe(0);
        });
    });

    describe("Score submission tests", () => {
        test("isScoreSubmitted should be false initially", () => {
            expect(game.isScoreSubmitted).toBe(false);
        });

        test("saveScore should set isScoreSubmitted to true", async () => {
            game.setPseudo("TestUser");
            game.unknowWord = "damien"; // Simulate winning the game
            await game.saveScore(1000);
            expect(game.isScoreSubmitted).toBe(true);
            expect(db.saveScore).toHaveBeenCalledWith("TestUser", 1000, "damien");
        });

        test("saveScore should not save score if game is not won", async () => {
            game.setPseudo("TestUser");
            await game.saveScore(1000);
            expect(game.isScoreSubmitted).toBe(false);
            expect(db.saveScore).not.toHaveBeenCalled();
        });

        test("saveScore should not save score if already submitted", async () => {
            game.setPseudo("TestUser");
            game.unknowWord = "damien"; // Simulate winning the game
            await game.saveScore(1000);
            expect(game.isScoreSubmitted).toBe(true);
            
            // Try to save score again
            await game.saveScore(1000);
            expect(db.saveScore).toHaveBeenCalledTimes(1); // Should only be called once
        });
    });

    describe("Game state tests", () => {
        test("isGameOver should return true when word is guessed", () => {
            game.unknowWord = "damien";
            expect(game.isGameOver()).toBe(true);
        });

        test("isGameOver should return true when no tries left", () => {
            game.numberOfTry = 0;
            expect(game.isGameOver()).toBe(true);
        });

        test("isGameOver should return false when game is ongoing", () => {
            game.numberOfTry = 3;
            game.unknowWord = "da####";
            expect(game.isGameOver()).toBe(false);
        });

        test("isGameWon should return true when word is guessed", () => {
            game.unknowWord = "damien";
            expect(game.isGameWon()).toBe(true);
        });

        test("isGameWon should return false when word is not guessed", () => {
            game.unknowWord = "da####";
            expect(game.isGameWon()).toBe(false);
        });
    });

    describe("Reset tests", () => {
        test("reset should set all game properties to initial values", () => {
            game.numberOfTry = 0;
            game.score = 500;
            game.pseudo = "TestUser";
            game.isScoreSubmitted = true;

            game.reset("newword");

            expect(game.getNumberOfTries()).toBe(5);
            expect(game.getScore()).toBe(1000);
            expect(game.pseudo).toBe('');
            expect(game.isScoreSubmitted).toBe(false);
        });
    });

    describe("Guessed letters tests", () => {
        test("guessedLetters should be empty initially", () => {
            expect(game.getGuessedLetters()).toBe('');
        });

        test("guess should add letter to guessedLetters", () => {
            game.guess('a');
            expect(game.getGuessedLetters()).toBe('a');
        });

        test("getGuessedLetters should return sorted, comma-separated list of guessed letters", () => {
            game.guess('a');
            game.guess('c');
            game.guess('b');
            expect(game.getGuessedLetters()).toBe('a, b, c');
        });

        test("guessing the same letter multiple times should not duplicate it in guessedLetters", () => {
            game.guess('a');
            game.guess('a');
            game.guess('b');
            game.guess('a');
            expect(game.getGuessedLetters()).toBe('a, b');
        });

        test("guessed letters should be case-insensitive", () => {
            game.guess('A');
            game.guess('a');
            game.guess('B');
            game.guess('b');
            expect(game.getGuessedLetters()).toBe('a, b');
        });

        test("reset should clear guessedLetters", () => {
            game.guess('a');
            game.guess('b');
            game.reset("newword");
            expect(game.getGuessedLetters()).toBe('');
        });

        test("guessing should work for both correct and incorrect letters", () => {
            game.guess('d'); // correct
            game.guess('x'); // incorrect
            expect(game.getGuessedLetters()).toBe('d, x');
        });

        test("guessing should not add letters after game is over", () => {
            game.numberOfTry = 1;
            game.guess('x'); // This should end the game
            game.guess('y'); // This should not be added
            expect(game.getGuessedLetters()).toBe('x');
        });
    });

    describe("Game mechanics", () => {
        test("guess should return true for correct guess", () => {
            expect(game.guess('d')).toBe(true);
        });

        test("guess should return false for incorrect guess", () => {
            expect(game.guess('z')).toBe(false);
        });

        test("guess should be case insensitive", () => {
            expect(game.guess('D')).toBe(true);
        });

        test("guess should not affect game state after game is over", () => {
            game.numberOfTry = 0;
            const initialUnknownWord = game.unknowWord;
            game.guess('d');
            expect(game.unknowWord).toBe(initialUnknownWord);
        });
    });

    describe("Score and time tests", () => {
        test("score should decrease over long periods of time", () => {
            const initialScore = game.getScore();
            jest.advanceTimersByTime(1001000); // Advance by more than 1000 seconds
            expect(game.getScore()).toBe(0);
        });

        test("endTime should be set when game is over", () => {
            game.numberOfTry = 1;
            game.guess('z');
            expect(game.endTime).not.toBeNull();
        });

        test("score should not change after game is over", () => {
            game.numberOfTry = 1;
            const initialScore = game.getScore();
            game.guess('z'); 
            const scoreAtEnd = game.getScore();
            expect(scoreAtEnd).toBeLessThan(initialScore); 
    
            jest.advanceTimersByTime(5000);
            expect(game.getScore()).toBe(scoreAtEnd); 
        });
    });

    test("getState should return the current game state", () => {
        const state = game.getState();
        expect(state).toEqual({
            word: 'damien',
            unknowWord: '######',
            numberOfTry: 5,
            score: 1000,
            startTime: expect.any(Number),
            endTime: null,
            pseudo: '',
            isScoreSubmitted: false,
            guessedLetters: []
        });
    });

    test("constructor should throw an error if state is not provided", () => {
        expect(() => new Game()).toThrow("Game state is required");
    });

    test("constructor should initialize game with provided state", () => {
        const customState = {
            word: 'test',
            unknowWord: '####',
            numberOfTry: 3,
            score: 500,
            startTime: Date.now(),
            endTime: null,
            pseudo: 'player1',
            isScoreSubmitted: false,
            guessedLetters: ['a', 'b']
        };
        const customGame = new Game(customState);
        expect(customGame.getState()).toEqual({
            ...customState,
            guessedLetters: expect.any(Array)
        });
    });

    test("setPseudo should set the pseudo", () => {
        game.setPseudo("testPlayer");
        expect(game.pseudo).toBe("testPlayer");
    });

    test("saveScore should not save score if game is not won", async () => {
        game.setPseudo("testPlayer");
        await game.saveScore(1000);
        expect(game.isScoreSubmitted).toBe(false);
        expect(db.saveScore).not.toHaveBeenCalled();
    });

    test("guess should handle end of game correctly", () => {
        game.numberOfTry = 1;
        game.guess('z'); // This should end the game
        expect(game.endTime).not.toBeNull();
        expect(game.guess('a')).toBe(false); // Should not affect the game state
    });
});

describe("Edge cases", () => {
    test("getScore should handle very long game durations", () => {
        const veryOldStartTime = Date.now() - 1000000000; // About 11.5 days ago
        game = new Game({...initialState, startTime: veryOldStartTime});
        expect(game.getScore()).toBe(0);
    });

    test("guess should handle empty string", () => {
        expect(game.guess('')).toBe(false);
        expect(game.getNumberOfTries()).toBe(4); // Should count as an incorrect guess
    });

    test("guess should handle non-alphabetic characters", () => {
        expect(game.guess('1')).toBe(false);
        expect(game.getNumberOfTries()).toBe(4);
        expect(game.guess('!')).toBe(false);
        expect(game.getNumberOfTries()).toBe(3);
    });

    describe("Error handling", () => {
        test("should throw an error if initialized without state", () => {
            expect(() => new Game()).toThrow("Game state is required");
        });
    });
});