const { generateFlop } = require("./deck-shuffler.js");
const DATA = require("./data.js");
const express = require("express");
const router = express.Router();

const defaultState = {
    game: {
        start: null,
        end: null,
    },
    teamNames: [ "Team Red", "Team Blue", "Team Green", "Team Yellow" ],
    flop: null,
    cards: Array.from({length: DATA.TEAM_NUM}, () => ({
        ...Object.fromEntries(DATA.TRAIN_COLOURS.map((c) => [c, 0])),
        [DATA.TRAIN_LOCOMOTIVE]: 0,
    })),
    tickets: Array.from({length: DATA.TEAM_NUM}, () => ({
        kept: [],
        choosing: [],
    })),
    challenges: Array.from({length: DATA.TEAM_NUM}, () => []),
    routes: DATA.GAME_MAP.routes.map(({colours}) => colours.map(() => null)),
};


let state = JSON.parse(JSON.stringify(defaultState));

router.get("/api/ticket-list", (req, res) => {
    res.send(JSON.stringify(DATA.TICKET_LIST));
});
router.get("/api/challenge-list", (req, res) => {
    res.send(JSON.stringify(DATA.CHALLENGE_LIST));
});
router.get("/api/map", (req, res) => {
    res.send(JSON.stringify(DATA.GAME_MAP));
});

router.get("/api/state", (req, res) => {
    res.send(JSON.stringify(state));
});

router.put("/api/reset", (req, res) => {
    state = JSON.parse(JSON.stringify(defaultState));
    res.status(200).send();
});

router.put("/api/start", (req, res) => {
    if (state.game.start) {
        res.status(403).send("Game already started. To reset game, PUT /api/reset.");
        return;
    }

    state.game.start = Date.now();
    state.game.end = state.game.start + DATA.GAME_MAX_DURATION;

    // Generate flop
    generateFlop(state);

    res.status(200).send();
});

module.exports = router;
