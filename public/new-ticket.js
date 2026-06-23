const team = localStorage.getItem('my_team') || '';
if (team) document.body.className = 'team-' + team;

// Sample ticket pool — replace or extend with your real locations and points
let ticketList;
let minKept;

// Draw tickets by asking the API for choices; fall back to local pool
async function drawTickets() {
    try {
        // If no valid team id, skip server call and fall back
        if (team === null || Number.isNaN(team)) {
            alert("No team selected");
            throw new Error('no-valid-team');
        }

        // Get full ticket list from server
        const listResp = await fetch('/api/ticket-list');
        if (!listResp.ok) throw new Error(`ticket-list fetch failed: ${await listResp.text()}`);
        ticketList = await listResp.json();

        // Request server to prepare a draw for this team
        const newResp = await fetch('/api/ticket-new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team }),
        });

        if (!newResp.ok) throw new Error(`ticket-new fetch failed: ${await newResp.text()}`);
        const res = await newResp.json();
        const choosing = res.choosing;
        minKept = res.minKept;

        if (choosing === null) {
            alert("Oh no, all tickets have been taken!");
            location.href = "ticket.html";
            return;
        }

        document.getElementById("minKeptLabel").innerHTML = minKept;

        return choosing;
    } catch (e) {
        alert(e.message);
        throw e;
    }
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
        badge.textContent = ticketList[t].points;
        tdPoints.appendChild(badge);

        // From
        const tdFrom = document.createElement('td');
        tdFrom.textContent = ticketList[t].from;

        // Arrow
        const tdArrow = document.createElement('td');
        tdArrow.innerHTML = '<span class="route-arrow">→</span>';

        // To
        const tdTo = document.createElement('td');
        tdTo.textContent = ticketList[t].to;

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
async function confirmTickets() {
    const kept = getKept();
    const warning = document.getElementById('keepWarning');

    if (kept.length === 0) {
        warning.style.display = '';
        setTimeout(() => warning.style.display = 'none', 3000);
        return;
    }

    try {
        const res = await fetch('/api/ticket-choose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                team,
                chosen: kept,
            }),
        });

        if (!res.ok) {
            throw new Error(`Error from ticket-choose: ${await res.text()}`);
        }

        location.href = "ticket.html";
    } catch (e) {
        alert(e.message);
        throw e;
    }
}

// Initialize draw by fetching from API (falls back to local pool)
(async function initDraw() {
    drawn = await drawTickets();
    renderDraw();
})();
