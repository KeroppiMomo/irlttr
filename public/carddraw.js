const TEAM_NAMES_KEY = 'team_names';
const FLOP_KEY       = 'shared_flop';
const HAND_KEY       = 'hand';

const team = localStorage.getItem('my_team') || '';
if (team) document.body.className = 'team-' + team;

let state;

// ── Card definitions ──
const COLOURS = ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'white', 'black', 'locomotive'];

const COLOUR_META = {
    pink:   { label: 'Pink',   cssClass: 'card-pink'   },
    red:    { label: 'Red',    cssClass: 'card-red'    },
    orange: { label: 'Orange', cssClass: 'card-orange' },
    yellow: { label: 'Yellow', cssClass: 'card-yellow' },
    green:  { label: 'Green',  cssClass: 'card-green'  },
    blue:   { label: 'Blue',   cssClass: 'card-blue'   },
    white:  { label: 'White',  cssClass: 'card-white'  },
    black:  { label: 'Black',  cssClass: 'card-black'  },
    locomotive:   { label: 'Wild',   cssClass: 'card-wild'   },
};

const FREE_DRAW_TIME = 20 * 60 * 1000;

function availHalfDraw(team) {
    let ans = 0;
    if (state.game.start) {
        for (let time = state.game.start; time < Date.now(); time += FREE_DRAW_TIME) {
            ans += 2 * !state.challenges[team].some(({start, end}) => (start < time && time < end));
        }
    }

    return ans - state.halfDraws[team];
}

// ── Hand rendering ──
function renderHand() {
    const grid = document.getElementById('handGrid');
    grid.innerHTML = '';

    COLOURS.forEach(c => {
        const count = state.cards[team][c];
        const meta  = COLOUR_META[c];

        const entry = document.createElement('div');
        entry.className = 'hand-entry';

        const pip = document.createElement('div');
        pip.className = 'hand-pip' + (c === 'locomotive' ? ' wild' : '');
        if (c !== 'locomotive') pip.style.background = pipColour(c);

        const label = document.createElement('span');
        label.className = 'hand-label';
        label.textContent = meta.label;

        const countEl = document.createElement('span');
        countEl.className = 'hand-count' + (count === 0 ? ' zero' : '');
        countEl.textContent = '×' + count;

        entry.appendChild(pip);
        entry.appendChild(label);
        entry.appendChild(countEl);
        grid.appendChild(entry);
    });
}

// Simple colour map for pips (CSS vars not available in JS)
function pipColour(c) {
    return {
        pink: '#f9a8d4', red: '#fca5a5', orange: '#fdba74', yellow: '#fde047',
        green: '#86efac', blue: '#93c5fd', white: '#e2e8f0', black: '#334155',
    }[c] || '#ccc';
}

// ── Train SVG icon ──
function trainSVG(colour) {
    const stroke = colour === 'black' ? '#f1f5f9' : 'currentColor';
    return `<svg class="card-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">
        <rect x="4" y="3" width="16" height="13" rx="3"/>
        <path d="M8 16l-2 4"/>
        <path d="M16 16l2 4"/>
        <path d="M9 20h6"/>
        <circle cx="8.5" cy="12" r="1"/>
        <circle cx="15.5" cy="12" r="1"/>
        <path d="M4 9h16"/>
        </svg>`;
}

// Wild card gets a rainbow train
function wildTrainSVG() {
    return `<svg class="card-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="url(#rainbowStroke)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">
        <defs>
        <linearGradient id="rainbowStroke" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="#e53e3e"/>
        <stop offset="33%"  stop-color="#d69e2e"/>
        <stop offset="66%"  stop-color="#38a169"/>
        <stop offset="100%" stop-color="#3182ce"/>
        </linearGradient>
        </defs>
        <rect x="4" y="3" width="16" height="13" rx="3"/>
        <path d="M8 16l-2 4"/>
        <path d="M16 16l2 4"/>
        <path d="M9 20h6"/>
        <circle cx="8.5" cy="12" r="1"/>
        <circle cx="15.5" cy="12" r="1"/>
        <path d="M4 9h16"/>
        </svg>`;
}

// ── Flop rendering ──
function renderFlop() {
    const flopEl = document.getElementById('flop');
    flopEl.innerHTML = '';

    if (!state.flop) {
        flopEl.innerHTML = "Not yet generated";
        return;
    }
    state.flop.forEach((colour, idx) => {
        const card = document.createElement('div');
        card.setAttribute('role', 'button');

        if (colour !== null) {
            const meta = COLOUR_META[colour];
            card.className = 'train-card ' + meta.cssClass;
            card.setAttribute('aria-label', 'Take ' + meta.label + ' card');
            card.innerHTML = (colour === 'locomotive' ? wildTrainSVG() : trainSVG(colour))
                + `<span class="card-label">${meta.label}</span>`;

            card.addEventListener('click', () => takeCard(idx));
        } else {
            card.className = 'train-card-null';
            card.innerHTML = 'X';
        }

        flopEl.appendChild(card);
    });
}

// ── Take a card from the flop ──
async function takeCard(idx) {
    try {
        const colour = state.flop[idx];

        const res = await fetch('/api/card-draw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                team,
                flopIndex: idx,
                expectedColour: colour,
            }),
        });

        if (!res.ok)
            throw new Error(`Error in card-draw: ${await res.text()}`);

        showToast('Took a ' + await res.text() + ' card');

        await update();
    } catch (e) {
        alert(e.message);
        throw e;
    }
}

// ── Blind draw ──
async function blindDraw() {
    try {
        const res = await fetch('/api/card-draw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                team,
                flopIndex: null,
                expectedColour: null,
            }),
        });

        if (!res.ok)
            throw new Error(`Error in card-draw: ${await res.text()}`);

        showToast('Drew a ' + await res.text() + ' card');

        await update();
    } catch (e) {
        alert(e.message);
        throw e;
    }
}

// ── Toast ──
let toastTimer = null;
function showToast(msg) {
    let toast = document.querySelector('.card-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'card-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.remove('hide');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hide'), 2000);
}

function setAvailLabel() {
    document.getElementById("drawsAvailableLabel").innerHTML = availHalfDraw(team)/2;
}

function setNextFreeLabel() {
    if (state && state.game.start) {
        const timeSinceStart = Date.now() - state.game.start;
        const remainingTime = FREE_DRAW_TIME - (timeSinceStart % FREE_DRAW_TIME);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        const minutes = Math.floor(remainingTime / 60 / 1000);
        const text = ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
        document.getElementById("nextDrawTimerLabel").innerHTML = text;
    }
}

async function update() {
    try {
        const res = await fetch("/api/state");
        if (!res.ok) {
            throw new Error(`Error fetching state: ${await res.text()}`);
        }
        state = await res.json();

        renderHand();
        setAvailLabel();
        renderFlop();
        setNextFreeLabel();
    } catch (e) {
        alert(e.message);
        throw e;
    }
}

update();
setInterval(update, 2000);

setInterval(setNextFreeLabel, 1000);
