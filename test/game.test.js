const Game = require('../game.js');
const db = require('../db');


jest.mock('../db', () => ({
    saveScore: jest.fn().mockResolvedValue(true),
    getTopScores: jest.fn().mockResolvedValue([])
}));

let game;

beforeEach(() => {
    jest.useFakeTimers();
    game = new Game();
    game.setWordList(['damien', 'test', 'word']);
    game.word = "damien"; // Setting a known word for tests
    game.unknowWord = "######";
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
        game.reset();
        expect(game.getNumberOfTries()).toBe(5);
    });

    test("number of tries shouldn't decrease under 0", () => {
        game.word = "carafe";
        game.unknowWord = "######";
        for (let i = 0; i < 10; i++) {
            game.guess("z");
        }
        expect(game.getNumberOfTries()).toBe(0);
    });

    test("should show only 'a' letter", () => {
        game.word = "damien";
        game.unknowWord = "######";
        game.guess("a");
        console.log(game.word);
        console.log(game.unknowWord);
        expect(game.print()).toBe("#a####");
    });


    test("should show all occurrences of a letter", () => {
        game.word = "carafe";
        game.unknowWord = "######";
        game.guess("a");
        expect(game.print()).toBe("#a#a##");
    });

    describe("Score test", () => {
        test("reset should set score back to 1000", () => {
            game.reset();
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
            game.score = 30;
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
            await game.saveScore();
            expect(game.isScoreSubmitted).toBe(true);
            expect(db.saveScore).toHaveBeenCalledWith("TestUser", expect.any(Number), "damien");
        });

        test("saveScore should not save score if game is not won", async () => {
            game.setPseudo("TestUser");
            await game.saveScore();
            expect(game.isScoreSubmitted).toBe(false);
            expect(db.saveScore).not.toHaveBeenCalled();
        });

        test("saveScore should not save score if already submitted", async () => {
            game.setPseudo("TestUser");
            game.unknowWord = "damien"; // Simulate winning the game
            await game.saveScore();
            expect(game.isScoreSubmitted).toBe(true);
            
            // Try to save score again
            await game.saveScore();
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

            game.reset();

            expect(game.numberOfTry).toBe(5);
            expect(game.score).toBe(1000);
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
            game.reset();
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


    test("should throw an error if no words are available", () => {
        game.listOfWords = [];
        expect(() => game.chooseWord()).toThrow("No words available to choose from.");
    });

});
