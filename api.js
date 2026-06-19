const { generateFlop } = require("./deck-shuffler.js");
const DATA = require("./data.js");
const express = require("express");
const router = express.Router();

router.use(express.json());

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
        choosing: null,
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

router.post("/api/reset", (req, res) => {
    state = JSON.parse(JSON.stringify(defaultState));
    res.status(200).send();
});

router.post("/api/start", (req, res) => {
    if (state.game.start) {
        res.status(403).send("Game already started. To reset game, POST /api/reset.");
        return;
    }

    state.game.start = Date.now();
    state.game.end = state.game.start + DATA.GAME_MAX_DURATION;

    // Generate flop
    generateFlop(state);

    res.status(200).send();
});

// Body format:
// { team: int }
router.post("/api/ticket-new", (req, res) => {
    if (req.body === undefined) {
        res.status(400).send("JSON request body not found");
        return;
    }

    const team = parseInt(req.body.team);
    if (!(0 <= team && team < DATA.TEAM_NUM)) {
        res.status(400).send(`Invalid parameter team ${req.body.team}`);
        return;
    }

    if (state.tickets[team].choosing === null) {
        const takenTickets = state.tickets.map(({kept, choosing}) =>
            kept.map(({id}) => id).concat(choosing === null ? [] : choosing)
        ).flat();

        let availableTickets =
            DATA.TICKET_LIST.map((_, i) => i)
            .filter((x) => !takenTickets.includes(x));

        if (availableTickets.length !== 0) {
            for (let i = 0; i < Math.min(availableTickets.length, DATA.TICKET_DRAW_SIZE); i++) {
                const j = Math.floor(Math.random() * (availableTickets.length - i)) + i;
                const x = availableTickets[i];
                availableTickets[i] = availableTickets[j];
                availableTickets[j] = x;
            }

            const choosing = availableTickets.slice(0, availableTickets.length);
            state.tickets[team].choosing = choosing;
        }
    }

    res.send(JSON.stringify(state.tickets[team].choosing));
});

// Body format:
// { team: int, chosen: array }
router.post("/api/ticket-choose", (req, res) => {
    if (req.body === undefined) {
        res.status(400).send("JSON request body not found");
        return;
    }

    const team = parseInt(req.body.team);
    if (!(0 <= team && team < DATA.TEAM_NUM)) {
        res.status(400).send(`Invalid parameter team ${req.body.team}`);
        return;
    }

    const chosen = req.body.chosen;
    if (!Array.isArray(chosen)) {
        res.status(400).send(`Invalid parameter chosen ${req.body.chosen}`);
        return;
    }

    if (state.tickets[team].choosing === null) {
        res.status(403).send(`Team ${team} is not currently choosing tickets`);
        return;
    }

    if (chosen.length === 0) {
        res.status(403).send("Must choose at least one ticket");
        return;
    }

    for (const ticket of chosen) {
        if (!state.tickets[team].choosing.includes(ticket)) {
            res.status(403).send(`Ticket ${ticket} is not an allowed choice: ${state.tickets[team].choosing}`);
            return;
        }
    }

    state.tickets[team].choosing = null;
    for (const ticket of chosen) {
        state.tickets[team].kept.push({
            id: ticket,
            completion: null,
        });
    }

    res.status(200).send();
});

module.exports = router;
