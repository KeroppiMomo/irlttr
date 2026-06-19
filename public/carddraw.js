const TEAM_NAMES_KEY = 'team_names';
const FLOP_KEY       = 'shared_flop';
const HAND_KEY       = 'hand';

const currentTeam = localStorage.getItem('my_team') || '';
if (currentTeam) document.body.className = 'team-' + currentTeam;

// ── Card definitions ──
const COLOURS = ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'white', 'black', 'wild'];

const COLOUR_META = {
    pink:   { label: 'Pink',   cssClass: 'card-pink'   },
    red:    { label: 'Red',    cssClass: 'card-red'    },
    orange: { label: 'Orange', cssClass: 'card-orange' },
    yellow: { label: 'Yellow', cssClass: 'card-yellow' },
    green:  { label: 'Green',  cssClass: 'card-green'  },
    blue:   { label: 'Blue',   cssClass: 'card-blue'   },
    white:  { label: 'White',  cssClass: 'card-white'  },
    black:  { label: 'Black',  cssClass: 'card-black'  },
    wild:   { label: 'Wild',   cssClass: 'card-wild'   },
};

// Deck: 12 of each colour + 14 wilds (typical Ticket to Ride distribution)
function buildDeck() {
    const deck = [];
    COLOURS.forEach(c => {
        const count = c === 'wild' ? 14 : 12;
        for (let i = 0; i < count; i++) deck.push(c);
    });
    return deck;
}

function randomCard() {
    const deck = buildDeck();
    return deck[Math.floor(Math.random() * deck.length)];
}

// ── Storage helpers ──
function handKey() { return HAND_KEY + '_' + (currentTeam || 'none'); }

function getHand() {
    try { return JSON.parse(localStorage.getItem(handKey())) || {}; } catch { return {}; }
}
function saveHand(h) { localStorage.setItem(handKey(), JSON.stringify(h)); }

function getFlop() {
    try {
        const f = JSON.parse(localStorage.getItem(FLOP_KEY));
        if (Array.isArray(f) && f.length === 5) return f;
    } catch {}
    // Initialise a fresh flop
    const fresh = Array.from({ length: 5 }, () => randomCard());
    localStorage.setItem(FLOP_KEY, JSON.stringify(fresh));
    return fresh;
}
function saveFlop(f) { localStorage.setItem(FLOP_KEY, JSON.stringify(f)); }

// ── Hand rendering ──
function renderHand() {
    const hand = getHand();
    const grid = document.getElementById('handGrid');
    grid.innerHTML = '';

    COLOURS.forEach(c => {
        const count = hand[c] || 0;
        const meta  = COLOUR_META[c];

        const entry = document.createElement('div');
        entry.className = 'hand-entry';

        const pip = document.createElement('div');
        pip.className = 'hand-pip' + (c === 'wild' ? ' wild' : '');
        if (c !== 'wild') pip.style.background = pipColour(c);

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
    const flop   = getFlop();
    const flopEl = document.getElementById('flop');
    flopEl.innerHTML = '';

    flop.forEach((colour, idx) => {
        const meta = COLOUR_META[colour];
        const card = document.createElement('div');
        card.className = 'train-card ' + meta.cssClass;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Take ' + meta.label + ' card');
        card.innerHTML = (colour === 'wild' ? wildTrainSVG() : trainSVG(colour))
            + `<span class="card-label">${meta.label}</span>`;

        card.addEventListener('click', () => takeCard(idx, colour));
        flopEl.appendChild(card);
    });
}

// ── Take a card from the flop ──
function takeCard(idx, colour) {
    if (!currentTeam) { showToast('Select a team first'); return; }

    // Animate
    const cardEls = document.querySelectorAll('#flop .train-card');
    if (cardEls[idx]) {
        cardEls[idx].classList.add('taking');
        cardEls[idx].addEventListener('animationend', () => cardEls[idx].classList.remove('taking'), { once: true });
    }

    // Add to hand
    const hand = getHand();
    hand[colour] = (hand[colour] || 0) + 1;
    saveHand(hand);

    // Replace card in flop with a new random one
    const flop = getFlop();
    flop[idx] = randomCard();
    saveFlop(flop);

    renderHand();
    renderFlop();
    showToast('Took 1 ' + COLOUR_META[colour].label + ' card');
}

// ── Blind draw ──
function blindDraw() {
    if (!currentTeam) { showToast('Select a team first'); return; }

    const colour = randomCard();
    const hand   = getHand();
    hand[colour] = (hand[colour] || 0) + 1;
    saveHand(hand);

    renderHand();
    showToast('Drew 1 ' + COLOUR_META[colour].label + ' card');
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

// ── Poll for shared flop updates every 4s ──
setInterval(() => { renderFlop(); }, 4000);

// ── Init ──
renderHand();
renderFlop();
