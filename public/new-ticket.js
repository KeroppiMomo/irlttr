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

// Draw 3 unique tickets at random
function drawTickets(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

const drawn = drawTickets(TICKET_POOL, 3);

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

renderDraw();
