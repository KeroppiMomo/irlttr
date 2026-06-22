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
    {
        points: 6,
        from: "Location X",
        to: "Location Y",
    },
    {
        points: 4,
        from: "Location E",
        to: "Location F",
    },
    {
        points: 100,
        from: "Location A'",
        to: "Location B'",
    },
    {
        points: 10,
        from: "Location C'",
        to: "Location D'",
    },
    {
        points: 6,
        from: "Location X'",
        to: "Location Y'",
    },
    {
        points: 4,
        from: "Location E'",
        to: "Location F'",
    },
];

module.exports.CHALLENGE_LIST = [
    {
        title: 'Bird watching',
        draws: 1,
        desc: 'Choose a bird, and take a 5-minute video with it always in frame.',
    },
    {
        title: 'Antiquity',
        draws: 2,
        desc: 'Without any research, visit a historic place and guess its age. You must then verify that the place is at least 100 years old and the guess is within 10% of the actual age. This challenge can be retried, but you cannot visit the same place twice.',
    },
    {
        title: 'Street food critic',
        draws: 1,
        desc: 'Find a street food vendor and try something you have never eaten before. Record a short video review.',
    },
    {
        title: 'Local hero',
        draws: 2,
        desc: 'Ask a local resident for their favourite hidden gem in the area and visit it. Take a photo as proof.',
    },
    {
        title: 'Tower view',
        draws: 2,
        desc: 'Find the highest publicly accessible viewpoint nearby and take a panoramic photo from the top.',
    },
    {
        title: 'Statue pose',
        draws: 1,
        desc: 'Find a statue or public sculpture and recreate its exact pose in a photo side-by-side.',
    },
    {
        title: 'Market bargain',
        draws: 1,
        desc: 'Visit a market and negotiate a purchase down by at least 20% from the asking price. Keep the receipt.',
    },
    {
        title: 'Language barrier',
        draws: 2,
        desc: 'Order food or ask for directions entirely in the local language without using a translation app. Record it.',
    },
    {
        title: 'Doorway gallery',
        draws: 1,
        desc: 'Photograph five distinctly different doorways or entrances within a 10-minute walk of your current location.',
    },
    {
        title: 'Number chase',
        draws: 2,
        desc: 'Find three different street signs, plaques, or markers that together contain the digits of the current year in order. Photograph each one.',
    },
];

module.exports.GAME_MAP = {
    locations: [
        {
            lat: 0.131575,
            long: 52.17424,
            name: "Cambridge South Station",
        },
        {
            lat: 0.1125737,
            long: 52.1754101,
            name: "Trumpington",
        },
        {
            lat: 0.1418629,
            long: 52.1754107,
            name: "Addenbrooke's",
        },
        {
            lat: 0.1697633,
            long: 52.1798451,
            name: "Chalk Pits",
        },
        {
            lat: 0.0932245,
            long: 52.1810072,
            name: "Grantchester",
        },
        {
            lat: 0.1351898,
            long: 52.1854027,
            name: "Homerton",
        },
        {
            lat: 0.1020156,
            long: 52.1886464,
            name: "Grantchester Meadows",
        },
        {
            lat: 0.1273479,
            long: 52.1936373,
            name: "Botanic Garden",
        },
        {
            lat: 0.1374478,
            long: 52.1942193,
            name: "Cambridge Station",
        },
        {
            lat: 0.1573937,
            long: 52.1958203,
            name: "Cherry Hinton Brook",
        },
        {
            lat: 0.1142804,
            long: 52.1967444,
            name: "Lammas Land",
        },
        {
            lat: 0.100967,
            long: 52.1982458,
            name: "Wolfson College",
        },
        {
            lat: 0.1202353,
            long: 52.1982868,
            name: "Department of Engineering",
        },
        {
            lat: 0.1272564,
            long: 52.1989095,
            name: "OLEM",
        },
        {
            lat: 0.1344584,
            long: 52.2032343,
            name: "ARU Cambridge",
        },
        {
            lat: 0.1237007,
            long: 52.2035986,
            name: "Emmanuel",
        },
        {
            lat: 0.117285,
            long: 52.2043356,
            name: "King's",
        },
        {
            lat: 0.1077233,
            long: 52.2051088,
            name: "University Library",
        },
        {
            lat: 0.1138635,
            long: 52.2066638,
            name: "Trinity Bridge",
        },
        {
            lat: 0.1316964,
            long: 52.206758,
            name: "The Grafton",
        },
        {
            lat: 0.1232727,
            long: 52.2083972,
            name: "Jesus",
        },
        {
            lat: 0.1733759,
            long: 52.2101904,
            name: "City Airport",
        },
        {
            lat: 0.0902269,
            long: 52.2103792,
            name: "West Hub",
        },
        {
            lat: 0.1010316,
            long: 52.2105205,
            name: "Centre for Mathematical Sciences",
        },
        {
            lat: 0.1345617,
            long: 52.2107592,
            name: "Boat Club",
        },
        {
            lat: 0.1549123,
            long: 52.2120926,
            name: "Cambridge United Football Club",
        },
        {
            lat: 0.1147187,
            long: 52.2120927,
            name: "Castle Mound",
        },
        {
            lat: 0.1206669,
            long: 52.2128819,
            name: "Jesus Lock",
        },
        {
            lat: 0.0943896,
            long: 52.2142252,
            name: "Northumberland Telescope",
        },
        {
            lat: 0.1378744,
            long: 52.2155254,
            name: "Chesterton",
        },
        {
            lat: 0.0873871,
            long: 52.2179984,
            name: "Eddington",
        },
        {
            lat: 0.1697104,
            long: 52.2212636,
            name: "Fen Ditton",
        },
        {
            lat: 0.15877,
            long: 52.224651,
            name: "Cambridge North Station",
        },
        {
            lat: 0.1038608,
            long: 52.225198,
            name: "Darwin Green",
        },
        {
            lat: 0.128475,
            long: 52.2269058,
            name: "Arbury",
        },
        {
            lat: 0.0836236,
            long: 52.2283846,
            name: "Girton",
        },
        {
            lat: 0.1490891,
            long: 52.2338735,
            name: "Science Park",
        },
        {
            lat: 0.154435,
            long: 52.2390278,
            name: "Big Tesco",
        },
    ],
    routes: [
        {
            from: 0,
            to: 1,
            length: 4,
            colours: ["white", null],
        },
        {
            from: 0,
            to: 2,
            length: 2,
            colours: ["orange", null],
        },
        {
            from: 0,
            to: 5,
            length: 5,
            colours: ["yellow"],
        },
        {
            from: 1,
            to: 7,
            length: 6,
            colours: [null, null],
        },
        {
            from: 1,
            to: 4,
            length: 4,
            colours: ["red", "black"],
        },
        {
            from: 2,
            to: 5,
            length: 4,
            colours: [null, null],
        },
        {
            from: 2,
            to: 3,
            length: 6,
            colours: ["blue"],
        },
        {
            from: 3,
            to: 8,
            length: 6,
            colours: [null],
        },
        {
            from: 3,
            to: 9,
            length: 6,
            colours: ["yellow", "black"],
        },
        {
            from: 4,
            to: 6,
            length: 3,
            colours: ["blue", "orange"],
        },
        {
            from: 5,
            to: 8,
            length: 3,
            colours: ["pink", "orange"],
        },
        {
            from: 6,
            to: 11,
            length: 3,
            colours: ["black", null],
        },
        {
            from: 6,
            to: 10,
            length: 4,
            colours: ["white"],
        },
        {
            from: 7,
            to: 10,
            length: 2,
            colours: ["red"],
        },
        {
            from: 7,
            to: 12,
            length: 2,
            colours: [null],
        },
        {
            from: 7,
            to: 13,
            length: 2,
            colours: ["green"],
        },
        {
            from: 7,
            to: 8,
            length: 3,
            colours: ["white"],
        },
        {
            from: 8,
            to: 9,
            length: 4,
            colours: [null, null],
        },
        {
            from: 8,
            to: 14,
            length: 4,
            colours: ["black"],
        },
        {
            from: 9,
            to: 21,
            length: 5,
            colours: ["pink"],
        },
        {
            from: 9,
            to: 25,
            length: 5,
            colours: ["blue"],
        },
        {
            from: 10,
            to: 11,
            length: 4,
            colours: [null],
        },
        {
            from: 10,
            to: 17,
            length: 4,
            colours: ["yellow"],
        },
        {
            from: 10,
            to: 12,
            length: 2,
            colours: ["pink"],
        },
        {
            from: 11,
            to: 17,
            length: 4,
            colours: ["green", null],
        },
        {
            from: 12,
            to: 16,
            length: 2,
            colours: ["yellow"],
        },
        {
            from: 12,
            to: 15,
            length: 2,
            colours: [null],
        },
        {
            from: 13,
            to: 14,
            length: 3,
            colours: ["blue"],
        },
        {
            from: 13,
            to: 15,
            length: 2,
            colours: ["black"],
        },
        {
            from: 14,
            to: 19,
            length: 1,
            colours: [null, null],
        },
        {
            from: 14,
            to: 25,
            length: 6,
            colours: ["blue"],
        },
        {
            from: 15,
            to: 16,
            length: 2,
            colours: ["green"],
        },
        {
            from: 15,
            to: 20,
            length: 2,
            colours: [null],
        },
        {
            from: 15,
            to: 19,
            length: 2,
            colours: ["red"],
        },
        {
            from: 16,
            to: 18,
            length: 2,
            colours: ["blue", "orange"],
        },
        {
            from: 16,
            to: 20,
            length: 3,
            colours: ["white"],
        },
        {
            from: 17,
            to: 23,
            length: 3,
            colours: ["white"],
        },
        {
            from: 17,
            to: 18,
            length: 1,
            colours: ["black", null],
        },
        {
            from: 18,
            to: 26,
            length: 1,
            colours: ["orange", null],
        },
        {
            from: 19,
            to: 24,
            length: 1,
            colours: [null],
        },
        {
            from: 19,
            to: 25,
            length: 5,
            colours: ["orange"],
        },
        {
            from: 20,
            to: 27,
            length: 2,
            colours: [null],
        },
        {
            from: 20,
            to: 24,
            length: 3,
            colours: ["blue"],
        },
        {
            from: 21,
            to: 25,
            length: 4,
            colours: [null, null],
        },
        {
            from: 21,
            to: 31,
            length: 3,
            colours: [null, null],
        },
        {
            from: 22,
            to: 28,
            length: 2,
            colours: [null, null],
        },
        {
            from: 22,
            to: 23,
            length: 2,
            colours: ["blue", "yellow"],
        },
        {
            from: 23,
            to: 26,
            length: 3,
            colours: ["pink"],
        },
        {
            from: 24,
            to: 27,
            length: 3,
            colours: ["black"],
        },
        {
            from: 24,
            to: 29,
            length: 2,
            colours: ["yellow", "pink"],
        },
        {
            from: 25,
            to: 31,
            length: 3,
            colours: ["red"],
        },
        {
            from: 25,
            to: 32,
            length: 3,
            colours: [null, null],
        },
        {
            from: 26,
            to: 27,
            length: 1,
            colours: [null],
        },
        {
            from: 26,
            to: 33,
            length: 5,
            colours: [null, null],
        },
        {
            from: 26,
            to: 35,
            length: 6,
            colours: [null],
        },
        {
            from: 27,
            to: 29,
            length: 4,
            colours: ["green"],
        },
        {
            from: 27,
            to: 34,
            length: 5,
            colours: ["black"],
        },
        {
            from: 28,
            to: 30,
            length: 2,
            colours: [null],
        },
        {
            from: 29,
            to: 32,
            length: 5,
            colours: [null, null],
        },
        {
            from: 29,
            to: 34,
            length: 4,
            colours: [null],
        },
        {
            from: 30,
            to: 35,
            length: 3,
            colours: ["black", "red"],
        },
        {
            from: 32,
            to: 36,
            length: 4,
            colours: ["orange"],
        },
        {
            from: 32,
            to: 37,
            length: 6,
            colours: ["pink"],
        },
        {
            from: 33,
            to: 35,
            length: 4,
            colours: ["green", "blue"],
        },
        {
            from: 33,
            to: 34,
            length: 6,
            colours: ["yellow"],
        },
        {
            from: 34,
            to: 36,
            length: 5,
            colours: ["green", "pink"],
        },
        {
            from: 36,
            to: 37,
            length: 2,
            colours: ["white", "red"],
        },
    ],
};
