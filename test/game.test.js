const Game = require('../game.js');

let game;

beforeAll(async () => {
    game = new Game();
    await game.loadWords();
    game.word = "damien"; // Setting a known word for tests
    game.unknowWord = "######";
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
        game.guess("kdjhgkfjhgdfkjhg");
        expect(game.getNumberOfTries()).toBe(4);
    });

    test("reset the game, so the number of tries should be 5", () => {
        game.reset();
        expect(game.getNumberOfTries()).toBe(5);
        game.word = "damien";
        game.unknowWord = "######";
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

        test("score should decrease over time", async () => {
            const initialScore = game.getScore();
            await new Promise(resolve => setTimeout(resolve, 2000)); 
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

    test("should throw an error if no words are available", () => {
        game.listOfWords = [];
        expect(() => game.chooseWord()).toThrow("No words available to choose from.");
    });

});
