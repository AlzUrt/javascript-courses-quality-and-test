require('dotenv').config();
const express = require('express');
const path = require('path');
const Game = require('./game.js');

const PORT = process.env.PORT || 3030;

const app = express();
const game = new Game();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (request, response) => {
    response.render('pages/index', {
        game: game.print(),
        word: game.word,
        numberOfTries: game.getNumberOfTries(),
        score: game.getScore(),
        isGameOver: game.isGameOver()
    });
});

app.post('/', (request, response) => {
    try {
        if (request.body.reset) {
            console.log("Reset !");
            game.reset();
        } else if (request.body.word && !game.isGameOver()) {
            let guess = game.guess(request.body.word);
            console.log("Guess :" + guess);
        } else {
            console.log("No word provided in the request body or game is over.");
        }

        response.render('pages/index', {
            game: game.print(),
            word: game.word,
            numberOfTries: game.getNumberOfTries(),
            score: game.getScore(),
            isGameOver: game.isGameOver()
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).send("An error occurred: " + error.message);
    }
});

// Add a new route to get the current score
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
