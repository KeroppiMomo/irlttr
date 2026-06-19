const CHALLENGE_STATE_KEY = 'challenge_state';
const TEAM_NAMES_KEY      = 'team_names';

const currentTeam = localStorage.getItem('my_team') || '';
if (currentTeam) document.body.className = 'team-' + currentTeam;

// ── Challenge definitions ──
const CHALLENGES = [
    {
        id: 'bird-watching',
        name: 'Bird watching',
        draws: 1,
        desc: 'Choose a bird, and take a 5-minute video with it always in frame.',
    },
    {
        id: 'antiquity',
        name: 'Antiquity',
        draws: 2,
        desc: 'Without any research, visit a historic place and guess its age. You must then verify that the place is at least 100 years old and the guess is within 10% of the actual age. This challenge can be retried, but you cannot visit the same place twice.',
    },
    {
        id: 'street-food',
        name: 'Street food critic',
        draws: 1,
        desc: 'Find a street food vendor and try something you have never eaten before. Record a short video review.',
    },
    {
        id: 'local-hero',
        name: 'Local hero',
        draws: 2,
        desc: 'Ask a local resident for their favourite hidden gem in the area and visit it. Take a photo as proof.',
    },
    {
        id: 'tower-view',
        name: 'Tower view',
        draws: 2,
        desc: 'Find the highest publicly accessible viewpoint nearby and take a panoramic photo from the top.',
    },
    {
        id: 'statue-pose',
        name: 'Statue pose',
        draws: 1,
        desc: 'Find a statue or public sculpture and recreate its exact pose in a photo side-by-side.',
    },
    {
        id: 'market-bargain',
        name: 'Market bargain',
        draws: 1,
        desc: 'Visit a market and negotiate a purchase down by at least 20% from the asking price. Keep the receipt.',
    },
    {
        id: 'language-barrier',
        name: 'Language barrier',
        draws: 2,
        desc: 'Order food or ask for directions entirely in the local language without using a translation app. Record it.',
    },
    {
        id: 'doorway-gallery',
        name: 'Doorway gallery',
        draws: 1,
        desc: 'Photograph five distinctly different doorways or entrances within a 10-minute walk of your current location.',
    },
    {
        id: 'number-chase',
        name: 'Number chase',
        draws: 2,
        desc: 'Find three different street signs, plaques, or markers that together contain the digits of the current year in order. Photograph each one.',
    },
];

// ── Storage helpers ──
function stateKey() { return CHALLENGE_STATE_KEY + '_' + (currentTeam || 'none'); }

function getState() {
    try { return JSON.parse(localStorage.getItem(stateKey())) || { active: null }; }
    catch { return { active: null }; }
}
function saveState(s) { localStorage.setItem(stateKey(), JSON.stringify(s)); }

// ── Build a challenge item element ──
function buildChallengeEl(challenge) {
    const cardIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px" aria-hidden="true"><rect x="2" y="4" width="14" height="18" rx="2"/><rect x="8" y="2" width="14" height="18" rx="2"/></svg>`;

    const item = document.createElement('div');
    item.className = 'challenge-item';

    const titleRow = document.createElement('div');
    titleRow.className = 'challenge-title-row';

    const name = document.createElement('span');
    name.className = 'challenge-name';
    name.textContent = challenge.name;

    const reward = document.createElement('span');
    reward.className = 'challenge-reward';
    reward.innerHTML = challenge.draws + ' ' + cardIcon;

    const desc = document.createElement('p');
    desc.className = 'challenge-desc';
    desc.textContent = challenge.desc;

    titleRow.appendChild(name);
    titleRow.appendChild(reward);
    item.appendChild(titleRow);
    item.appendChild(desc);
    return item;
}

// ── Render idle view ──
function renderIdle() {
    const list = document.getElementById('challengeList');
    list.innerHTML = '';
    CHALLENGES.forEach(c => list.appendChild(buildChallengeEl(c)));

    document.getElementById('viewIdle').style.display = '';
    document.getElementById('viewActive').style.display = 'none';
}

// ── Render active view ──
function renderActive(challenge) {
    const container = document.getElementById('activeChallenge');
    container.innerHTML = '';
    container.appendChild(buildChallengeEl(challenge));

    document.getElementById('viewIdle').style.display = 'none';
    document.getElementById('viewActive').style.display = '';
}

// ── Start: pick a random challenge ──
function startChallenge() {
    const pick = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    saveState({ active: pick });
    renderActive(pick);
}

// ── End: complete or veto ──
function endChallenge(outcome) {
    // outcome is 'complete' or 'veto' — hook in scoring/log here later if needed
    saveState({ active: null });
    renderIdle();
}

// ── Init ──
(function init() {
    const state = getState();
    if (state.active) {
        renderActive(state.active);
    } else {
        renderIdle();
    }
})();
