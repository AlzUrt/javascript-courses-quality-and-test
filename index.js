require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const Game = require('./game.js');
const db = require('./db.js');

const PORT = process.env.PORT || 3030;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true,
}));
app.set('view engine', 'ejs');

// Function to get or create a game state for the session
async function getOrCreateGameState(req) {
    if (!req.session.gameState) {
        const wordOfTheDay = await db.getWordOfTheDay();
        req.session.gameState = {
            word: wordOfTheDay,
            unknowWord: wordOfTheDay.replace(/./g, '#'),
            numberOfTry: 5,
            score: 1000,
            startTime: Date.now(),
            endTime: null,
            pseudo: '',
            isScoreSubmitted: false,
            guessedLetters: []
        };
    }
    return req.session.gameState;
}

// Middleware to ensure game state is initialized and create Game instance
app.use(async (req, res, next) => {
    try {
        const gameState = await getOrCreateGameState(req);
        req.game = new Game(gameState);
        next();
    } catch (error) {
        console.error("Error initializing game:", error);
        res.status(500).send("An error occurred while initializing the game");
    }
});

// Routes
app.get('/', async (request, response) => {
    console.log("word : " + request.game.word);
    const topScores = await db.getTopScores();
    response.render('pages/index', {
        game: request.game.print(),
        word: request.game.word,
        numberOfTries: request.game.getNumberOfTries(),
        score: request.game.getScore(),
        isGameOver: request.game.isGameOver(),
        isGameWon: request.game.isGameWon(),
        isScoreSubmitted: request.game.isScoreSubmitted,
        guessedLetters: request.game.getGuessedLetters(),
        topScores: topScores
    });
});

app.post('/', async (request, response) => {
    try {
        if (request.body.reset) {
            console.log("Reset !");
            const wordOfTheDay = await db.getWordOfTheDay();
            request.game.reset(wordOfTheDay);
        } else if (request.body.word && !request.game.isGameOver()) {
            let guess = request.game.guess(request.body.word);
            console.log("Guess :" + guess);
        } else if (request.body.pseudo && request.game.isGameWon() && !request.game.isScoreSubmitted) {
            request.game.setPseudo(request.body.pseudo);
            const finalScore = parseInt(request.body.finalScore, 10);
            await request.game.saveScore(finalScore);
        } else {
            console.log("No valid action in the request body or game is over.");
        }

        // Update session with new game state
        request.session.gameState = request.game.getState();

        const topScores = await db.getTopScores();
        response.render('pages/index', {
            game: request.game.print(),
            word: request.game.word,
            numberOfTries: request.game.getNumberOfTries(),
            score: request.game.getScore(),
            isGameOver: request.game.isGameOver(),
            isGameWon: request.game.isGameWon(),
            isScoreSubmitted: request.game.isScoreSubmitted,
            guessedLetters: request.game.getGuessedLetters(),
            topScores: topScores
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).send("An error occurred: " + error.message);
    }
});

app.get('/score', (request, response) => {
    response.json({ score: request.game.getScore() });
});

(async () => {
    try {
        await db.initDatabase();
        app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
    } catch (error) {
        console.error("Failed to initialize database and start the server:", error);
    }
})();