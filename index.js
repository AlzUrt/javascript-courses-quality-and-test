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
        const lastPlayedDate = await db.getLastPlayedDate();
        req.session.gameState = {
            word: wordOfTheDay,
            unknowWord: wordOfTheDay.replace(/./g, '#'),
            numberOfTry: 5,
            score: 1000,
            startTime: Date.now(),
            endTime: null,
            pseudo: '',
            isScoreSubmitted: false,
            guessedLetters: [],
            lastPlayedDate: lastPlayedDate
        };
    }
    return new Game(req.session.gameState);
}

// Routes
app.get('/', async (request, response) => {
    const game = await getOrCreateGameState(request);
    console.log("word : " + game.word);
    const topScores = await db.getTopScores();
    const canPlayToday = game.canPlayToday();

    response.render('pages/index', {
        game: game.print(),
        word: game.word,
        numberOfTries: game.getNumberOfTries(),
        score: game.getScore(),
        isGameOver: game.isGameOver(),
        isGameWon: game.isGameWon(),
        isScoreSubmitted: game.isScoreSubmitted,
        guessedLetters: game.getGuessedLetters(),
        topScores: topScores,
        canPlayToday: canPlayToday
    });
});

app.post('/', async (request, response) => {
    try {
        const game = await getOrCreateGameState(request);
        
        if (!game.canPlayToday()) {
            throw new Error("You can only play once per day");
        }

        if (request.body.reset) {
            console.log("Reset !");
            const wordOfTheDay = await db.getWordOfTheDay();
            await game.reset(wordOfTheDay);
        } else if (request.body.word && !game.isGameOver()) {
            let guess = game.guess(request.body.word);
            console.log("Guess :" + guess);
        } else if (request.body.pseudo && game.isGameWon() && !game.isScoreSubmitted) {
            game.setPseudo(request.body.pseudo);
            const finalScore = parseInt(request.body.finalScore, 10);
            await game.saveScore(finalScore);
        } else {
            console.log("No valid action in the request body or game is over.");
        }

        // Update session with new game state
        request.session.gameState = game.getState();

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
            topScores: topScores,
            canPlayToday: game.canPlayToday()
        });
    } catch (error) {
        console.error(error.message);
        response.status(400).send(error.message);
    }
});

app.get('/score', async (request, response) => {
    const game = await getOrCreateGameState(request);
    response.json({ score: game.getScore() });
});

(async () => {
    try {
        await db.initDatabase();
        app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
    } catch (error) {
        console.error("Failed to initialize database and start the server:", error);
    }
})();