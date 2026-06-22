const TICKETS_KEY    = 'tickets';
const TEAM_NAMES_KEY = 'team_names';

const currentTeam = localStorage.getItem('my_team') || '';
if (currentTeam) document.body.className = 'team-' + currentTeam;

// Sample ticket pool — replace or extend with your real locations and points
const TICKET_POOL = [
    { points: 4,  from: 'Central Station',  to: 'Old Town Square'    },
    { points: 6,  from: 'Harbour Bridge',   to: 'Botanical Gardens'  },
    { points: 8,  from: 'North Gate',       to: 'Riverside Market'   },
    { points: 5,  from: 'Museum Hill',      to: 'East Docks'         },
    { points: 10, from: 'Castle Ruins',     to: 'Southern Ferry'     },
    { points: 3,  from: 'City Library',     to: 'Bell Tower'         },
    { points: 7,  from: 'West Park',        to: 'Underground Vault'  },
    { points: 9,  from: 'Grand Bazaar',     to: 'Lighthouse Point'   },
    { points: 5,  from: 'Clocktower Plaza', to: 'Royal Gardens'      },
    { points: 6,  from: 'Merchant Quarter', to: 'Sea Cliff Lookout'  },
    { points: 8,  from: 'Iron Bridge',      to: 'Mountain Pass'      },
    { points: 4,  from: 'Silk Road Inn',    to: 'Forge District'     },
];

// Draw tickets by asking the API for choices; fall back to local pool
async function drawTickets(pool, count) {
    try {
        // Determine numeric team id (stored as string in localStorage)
        const rawTeam = localStorage.getItem('my_team');
        const teamName = rawTeam || '';
        let teamId = null;
        if (rawTeam) {
            if (/^\d+$/.test(rawTeam)) {
                teamId = parseInt(rawTeam, 10);
            } else {
                // accept variants like "Team Red", "red", "Red"
                const key = String(rawTeam).toLowerCase().trim().replace(/^team\s+/, '');
                const map = { red: 0, blue: 1, green: 2, yellow: 3 };
                if (Object.prototype.hasOwnProperty.call(map, key)) teamId = map[key];
            }
        }

        // If no valid team id, skip server call and fall back
        if (teamId === null || Number.isNaN(teamId)) throw new Error('no-valid-team');

        // Get full ticket list from server
        const listResp = await fetch('/api/ticket-list');
        if (!listResp.ok) throw new Error('ticket-list fetch failed');
        const ticketList = await listResp.json();

        // Request server to prepare a draw for this team
        const newResp = await fetch('/api/ticket-new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team: teamId }),
        });

        if (!newResp.ok) throw new Error('ticket-new fetch failed');
        const choosing = await newResp.json();

        // `choosing` is an array of ticket indices — map to full ticket objects
        if (Array.isArray(choosing) && choosing.length > 0) {
            return choosing.slice(0, count).map(i => ticketList[i]);
        }
    } catch (e) {
        // silent fallthrough to local draw on any error
        console.warn('new-ticket: drawTickets error', e && e.message ? e.message : e);
    }

    // // Fallback: local random draw
    // const shuffled = [...pool].sort(() => Math.random() - 0.5);
    // return shuffled.slice(0, count);
}

let drawn = [];

// Render the draw table
function renderDraw() {
    const tbody = document.getElementById('drawBody');
    tbody.innerHTML = '';

    drawn.forEach((t, i) => {
        const tr = document.createElement('tr');

        // Keep checkbox
        const tdCheck = document.createElement('td');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'keep-checkbox';
        cb.id = 'keep-' + i;
        cb.checked = true; // default: keep all
        cb.addEventListener('change', updateRowStyles);
        tdCheck.appendChild(cb);

        // Points
        const tdPoints = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'points-badge';
        badge.textContent = t.points;
        tdPoints.appendChild(badge);

        // From
        const tdFrom = document.createElement('td');
        tdFrom.textContent = t.from;

        // Arrow
        const tdArrow = document.createElement('td');
        tdArrow.innerHTML = '<span class="route-arrow">→</span>';

        // To
        const tdTo = document.createElement('td');
        tdTo.textContent = t.to;

        tr.appendChild(tdCheck);
        tr.appendChild(tdPoints);
        tr.appendChild(tdFrom);
        tr.appendChild(tdArrow);
        tr.appendChild(tdTo);
        tbody.appendChild(tr);
    });

    updateRowStyles();
}

function updateRowStyles() {
    const rows = document.querySelectorAll('#drawBody tr');
    rows.forEach((tr, i) => {
        const cb = document.getElementById('keep-' + i);
        tr.classList.toggle('dimmed', !cb.checked);
    });
}

function getKept() {
    return drawn.filter((_, i) => document.getElementById('keep-' + i).checked);
}

// Storage helpers
function ticketKey() { return TICKETS_KEY + '_' + (currentTeam || 'none'); }
function getTickets() { try { return JSON.parse(localStorage.getItem(ticketKey())) || []; } catch { return []; } }
function saveTickets(t) { localStorage.setItem(ticketKey(), JSON.stringify(t)); }

function confirmTickets() {
    const kept = getKept();
    const warning = document.getElementById('keepWarning');

    if (kept.length === 0) {
        warning.style.display = '';
        setTimeout(() => warning.style.display = 'none', 3000);
        return;
    }

    const existing = getTickets();
    const newTickets = kept.map(t => ({
        id:          Date.now() + '-' + Math.random().toString(36).slice(2),
        points:      t.points,
        from:        t.from,
        to:          t.to,
        done:        false,
        completedAt: null,
    }));

    saveTickets([...existing, ...newTickets]);
    window.location.href = 'ticket.html';
}

// Initialize draw by fetching from API (falls back to local pool)
(async function initDraw() {
    drawn = await drawTickets(TICKET_POOL, 3);
    renderDraw();
})();
