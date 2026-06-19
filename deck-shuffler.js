const DATA = require("./data.js");

function flopTooManyLocomotives(state) {
    const locomotiveCount = state.flop.filter(card => card === DATA.TRAIN_LOCOMOTIVE).length;
    return locomotiveCount > DATA.FLOP_MAX_LOCOMOTIVE;
}

function buildDeck(state) {
    let freqDict = {
        ...Object.fromEntries(DATA.TRAIN_COLOURS.map((c) => [c, DATA.COLOURED_TRAIN_NUM])),
        [DATA.TRAIN_LOCOMOTIVE]: DATA.LOCOMOTIVE_NUM,
    }

    for (const colour of state.flop) {
        if (colour) freqDict[colour]--;
    }
    for (const teamCards of state.cards) {
        for (colour of DATA.TRAIN_COLOURS) {
            freqDict[colour] -= teamCards[colour];
        }
        freqDict[DATA.TRAIN_LOCOMOTIVE] -= teamCards[DATA.TRAIN_LOCOMOTIVE];
    }

    const deck = [];

    for (const colour of DATA.TRAIN_COLOURS) {
        for (let i = 0; i < freqDict[colour]; i++) {
            deck.push(colour);
        }
    }
    for (let i = 0; i < freqDict[DATA.TRAIN_LOCOMOTIVE]; i++) {
        deck.push(DATA.TRAIN_LOCOMOTIVE);
    }

    return deck;
}

function sampleFromDeck(state) {
    const deck = buildDeck(state);
    if (deck.length === 0) return null;
    const i = Math.floor(Math.random() * deck.length)
    return deck[i];
}

function generateFlop(state) {
    do {
        state.flop = [];
        for (let i = 0; i < DATA.FLOP_SIZE; i++) {
            const card = sampleFromDeck(state);
            state.flop.push(card);
        }
    } while (flopTooManyLocomotives(state));
}

module.exports = {
    generateFlop,
};
