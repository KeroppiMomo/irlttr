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
    teamNames: [ "Team Red", "Team Blue", "Team Yellow", "Team Green" ],
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

    const lastKeepTime = state.tickets[team].kept.reduce((max, item) => Math.max(max, item.keptAt), 0);
    if (Date.now() - lastKeepTime < DATA.TICKET_DRAW_TIME && lastKeepTime >= state.game.start) {
        res.status(403).send(`Ticket draw too often: last draw at ${lastKeepTime}`);
        return;
    }

    if (state.tickets[team].choosing === null) {
        const takenTickets = state.tickets.map(({kept, choosing}) =>
            kept.map(({id}) => id).concat(choosing === null ? [] : choosing)
        ).flat();

        let availableTickets =
            DATA.TICKET_LIST.map((_, i) => i)
            .filter((x) => !takenTickets.includes(x));

        const drawSize = state.game.start ? DATA.TICKET_DRAW_SIZE : DATA.TICKET_START_DRAW_SIZE;

        if (availableTickets.length !== 0) {
            for (let i = 0; i < Math.min(availableTickets.length, drawSize); i++) {
                const j = Math.floor(Math.random() * (availableTickets.length - i)) + i;
                const x = availableTickets[i];
                availableTickets[i] = availableTickets[j];
                availableTickets[j] = x;
            }

            const choosing = availableTickets.slice(0, Math.min(availableTickets.length, drawSize));
            state.tickets[team].choosing = choosing;
        }
    }

    const minKept = state.game.start ? DATA.TICKET_DRAW_MIN_KEPT : DATA.TICKET_START_DRAW_MIN_KEPT;
    res.send(JSON.stringify({
        choosing: state.tickets[team].choosing,
        minKept,
    }));
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

    for (const ticket of chosen) {
        if (!state.tickets[team].choosing.includes(ticket)) {
            res.status(403).send(`Ticket ${ticket} is not an allowed choice: ${state.tickets[team].choosing}`);
            return;
        }
    }

    const lastKeepTime = state.tickets[team].kept.reduce((max, item) => Math.max(max, item.keptAt), 0);
    if (Date.now() - lastKeepTime < DATA.TICKET_DRAW_TIME && lastKeepTime >= state.game.start) {
        res.status(403).send(`Ticket draw too often: last draw at ${lastKeepTime}`);
        return;
    }

    const minKept = state.game.start ? DATA.TICKET_DRAW_MIN_KEPT : DATA.TICKET_START_DRAW_MIN_KEPT;
    if (chosen.length < minKept) {
        res.status(403).send(`Too few ticket chosen: must keep ${minKept}`);
        return;
    }

    state.tickets[team].choosing = null;
    for (const ticket of chosen) {
        state.tickets[team].kept.push({
            id: ticket,
            keptAt: Date.now(),
            completion: null,
        });
    }

    res.status(200).send();
});

router.post("/api/challenge-start", (req, res) => {
    if (req.body === undefined) {
        res.status(400).send("JSON request body not found");
        return;
    }

    const team = parseInt(req.body.team);
    if (!(0 <= team && team < DATA.TEAM_NUM)) {
        res.status(400).send(`Invalid parameter team ${req.body.team}`);
        return;
    }

    if (state.challenges[team].length !== 0 && state.challenges[team].at(-1).end === null) {
        res.status(403).send("Could not start challenge while there is ongoing challenge");
        return;
    }

    // Pick two
    const challenge1 = Math.floor(Math.random() * DATA.CHALLENGE_LIST.length);
    const challenge2 = (() => {
        let x;
        do {
            x = Math.floor(Math.random() * DATA.CHALLENGE_LIST.length);
        } while (x === challenge1);
        return x;
    })();
    const challenges = [challenge1, challenge2];

    state.challenges[team].push({
        id: challenges,
        start: Date.now(),
        end: null,
        result: null,
    });

    res.send(JSON.stringify(challenges));
});

router.post("/api/challenge-end", (req, res) => {
    if (req.body === undefined) {
        res.status(400).send("JSON request body not found");
        return;
    }

    const team = parseInt(req.body.team);
    if (!(0 <= team && team < DATA.TEAM_NUM)) {
        res.status(400).send(`Invalid parameter team ${req.body.team}`);
        return;
    }

    const result = req.body.result;
    if (!(["complete", "veto-point", "veto-time"].includes(result))) {
        res.status(400).send(`Unknown result ${result}`);
        return;
    }

    if (!(state.challenges[team].length !== 0 && state.challenges[team].at(-1).end === null)) {
        res.status(403).send("Could not end challenge while there is no ongoing challenge");
        return;
    }

    const curChall = state.challenges[team].at(-1);
    curChall.end = Date.now();
    curChall.result = result;

    res.status(200).send();
});

module.exports = router;
