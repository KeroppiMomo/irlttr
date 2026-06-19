module.exports.TEAM_NUM = 4;
module.exports.GAME_MAX_DURATION = 5.5 * 60 * 60 * 1000; // in milliseconds

module.exports.FLOP_SIZE = 5;
module.exports.FLOP_MAX_LOCOMOTIVE = 2;

module.exports.TRAIN_COLOURS = [ "pink", "red", "orange", "yellow", "green", "blue", "white", "black" ];
module.exports.COLOURED_TRAIN_NUM = 12;
module.exports.TRAIN_LOCOMOTIVE = "locomotive";
module.exports.LOCOMOTIVE_NUM = 14;

module.exports.TICKET_DRAW_SIZE = 3;

module.exports.TICKET_LIST = [
    {
        points: 6,
        from: "Location A",
        to: "Location B",
    },
    {
        points: 10,
        from: "Location C",
        to: "Location D",
    },
];

module.exports.CHALLENGE_LIST = [
    {
        draws: 1,
        title: "Fast food",
        desc: "Visit any restaurant/store that sells food, order a food item and finish it there.",
    },
    {
        draws: 2,
        title: "Antiquity",
        desc: "Without any research, visit a historic place and guess its age. You must then verify that the place is at least 100 years old and the guess is within 10% of the actual age. This challenge can be retried, but you cannot visit the same place twice.",
    },
];

module.exports.GAME_MAP = {
    locations: [
        {
            name: "Emmanuel",
            lat: 52.20360184740931,
            long: 0.12370787702016553,
        },
        {
            name: "Cambridge Station",
            lat: 52.19423714512728,
            long: 0.13734446165983646,
        },
        {
            name: "Market Square",
            lat: 52.205359149009766,
            long: 0.11901944323811436,
        },
    ],
    routes: [
        {
            from: 0,
            to: 1,
            length: 4,
            colours: [null],
        },
        {
            from: 0,
            to: 2,
            length: 2,
            colours: ["red", "green"],
        },
    ],
};
