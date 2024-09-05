require('dotenv').config();
const express = require('express');
const path = require('path');
const Game = require('./game.js');
const db = require('./db.js');

const PORT = process.env.PORT || 3030;

const app = express();
const game = new Game();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (request, response) => {
    console.log("word : " + game.word);
    const topScores = await db.getTopScores();
    response.render('pages/index', {
        game: game.print(),
        word: game.word,
        numberOfTries: game.getNumberOfTries(),
        score: game.getScore(),
        isGameOver: game.isGameOver(),
        isGameWon: game.isGameWon(),
        isScoreSubmitted: game.isScoreSubmitted,
        guessedLetters: game.getGuessedLetters(),
        topScores: topScores
    });
});

app.post('/', async (request, response) => {
    try {
        if (request.body.reset) {
            console.log("Reset !");
            game.reset();
        } else if (request.body.word && !game.isGameOver()) {
            let guess = game.guess(request.body.word);
            console.log("Guess :" + guess);
        } else if (request.body.pseudo && game.isGameWon() && !game.isScoreSubmitted) {
            game.setPseudo(request.body.pseudo);
            await game.saveScore();
        } else {
            console.log("No valid action in the request body or game is over.");
        }

        const topScores = await db.getTopScores();
        response.render('pages/index', {
            game: game.print(),
            word: game.word,
            numberOfTries: game.getNumberOfTries(),
            score: game.getScore(),
            isGameOver: game.isGameOver(),
            isGameWon: game.isGameWon(),
            isScoreSubmitted: game.isScoreSubmitted,
            guessedLetters: game.getGuessedLetters(),
            topScores: topScores
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).send("An error occurred: " + error.message);
    }
});

// Nouvelle route pour obtenir le score actuel
app.get('/score', (request, response) => {
    response.json({ score: game.getScore() });
});


(async () => {
    try {
        await game.loadWords();
        app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
    } catch (error) {
        console.error("Failed to load words and start the server:", error);
    }
})();
