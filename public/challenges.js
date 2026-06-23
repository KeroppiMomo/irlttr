const CHALLENGE_STATE_KEY = 'challenge_state';
const TEAM_NAMES_KEY      = 'team_names';

const currentTeam = localStorage.getItem('my_team') || -1;
if (currentTeam) document.body.className = 'team-' + currentTeam;

let CHALLENGES;

// ── Build a challenge item element ──
function buildChallengeEl(challenge) {
    const cardIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px" aria-hidden="true"><rect x="2" y="4" width="14" height="18" rx="2"/><rect x="8" y="2" width="14" height="18" rx="2"/></svg>`;

    const item = document.createElement('div');
    item.className = 'challenge-item';

    const titleRow = document.createElement('div');
    titleRow.className = 'challenge-title-row';

    const name = document.createElement('span');
    name.className = 'challenge-name';
    name.textContent = challenge.title;

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
function renderActive(challenges) {
    const container1 = document.getElementById('activeChallenge1');
    container1.innerHTML = '';
    container1.appendChild(buildChallengeEl(CHALLENGES[challenges[0]]));

    const container2 = document.getElementById('activeChallenge2');
    container2.innerHTML = '';
    container2.appendChild(buildChallengeEl(CHALLENGES[challenges[1]]));

    document.getElementById('viewIdle').style.display = 'none';
    document.getElementById('viewActive').style.display = '';
}

// ── Start: pick a random challenge via the backend API ──
async function startChallenge() {
    try {
        const response = await fetch('/api/challenge-start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ team: currentTeam })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to start challenge');
        }

        // The backend returns an array of two challenge indices, e.g., [1, 5]
        const challengeIndices = await response.json();

        renderActive(challengeIndices);

    } catch (error) {
        console.error("Error communicating with API:", error);
        alert(`Could not start challenge: ${error.message}`);
    }
}

// ── End: complete or veto ──
async function endChallenge(result) {
    const response = await fetch('/api/challenge-end', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            team: currentTeam,
            result: result,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        alert("Error communicating with API:", errorText);
        throw new Error(errorText || 'Failed to start challenge');
    }

    renderIdle();
}

// ── Init ──
(async function init() {
    [challengeRes, stateRes] = await Promise.all([
        fetch("api/challenge-list"),
        fetch("api/state"),
    ]);

    if (!challengeRes.ok) {
        alert("Could not fetch challenge list");
        console.error(challengeRes);
        throw new Error("Could not fetch challenge list");
    }
    if (!stateRes.ok) {
        alert("Could not fetch state");
        console.error(stateRes);
        throw new Error("Could not fetch state");
    }

    CHALLENGES = await challengeRes.json();
    const state = await stateRes.json();

    const teamChall = state.challenges[currentTeam];
    if (teamChall.length === 0 || teamChall.at(-1).end !== null) {
        renderIdle();
    } else {
        renderActive(teamChall.at(-1).id);
    }
})();
