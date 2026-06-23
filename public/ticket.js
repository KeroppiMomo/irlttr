const TEAM_NAMES_KEY = 'team_names';

const team = localStorage.getItem('my_team') || -1;

if (team) document.body.className = 'team-' + team;

let state;
let ticketList;

function renderTickets() {
    const empty = document.getElementById('ticketEmpty');
    const table = document.getElementById('ticketTable');
    const tbody = document.getElementById('ticketBody');

    const keptTickets = state.tickets[team].kept;

    if (keptTickets.length === 0) {
        empty.style.display = '';
        table.style.display = 'none';
        return;
    }
    empty.style.display = 'none';
    table.style.display = '';
    tbody.innerHTML = '';

    keptTickets.forEach(t => {
        const tr = document.createElement('tr');
        if (t.completion) tr.classList.add('completed');

        const tdStatus = document.createElement('td');
        const iconBtn = document.createElement('button');
        iconBtn.className = 'status-icon ' + (t.completion ? 'done' : 'todo');
        iconBtn.title = t.completion ? 'Mark as incomplete' : 'Mark as complete';
        iconBtn.setAttribute('aria-label', t.completion ? 'Mark as incomplete' : 'Mark as complete');
        iconBtn.innerHTML = t.completion
            ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        iconBtn.onclick = () => toggleDone(t.id);
        tdStatus.appendChild(iconBtn);
        if (t.completion) {
            const d = new Date(t.completion);
            const text = formatTime(d);
            const timeSpan = document.createElement('span');
            timeSpan.className = 'completion-time';

            timeSpan.textContent = text;
            tdStatus.appendChild(timeSpan);
        }

        const tdPoints = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'points-badge';
        badge.textContent = ticketList[t.id].points;
        tdPoints.appendChild(badge);

        const tdFrom = document.createElement('td');
        tdFrom.textContent = ticketList[t.id].from;

        const tdArrow = document.createElement('td');
        tdArrow.innerHTML = '<span class="route-arrow">→</span>';

        const tdTo = document.createElement('td');
        tdTo.textContent = ticketList[t.id].to;

        tr.appendChild(tdStatus);
        tr.appendChild(tdPoints);
        tr.appendChild(tdFrom);
        tr.appendChild(tdArrow);
        tr.appendChild(tdTo);
        tbody.appendChild(tr);
    });
}

function setTimeLabel() {
    const lastKeepTime = state.tickets[team].kept.reduce((max, item) => Math.max(max, item.keptAt), 0);
    const drawTime = lastKeepTime + 30 * 60 * 1000;
    const label = document.getElementById("drawTimeLabel");
    if (!state.game.start) {
        label.innerHTML = "Pre-start draw";
    } else if (Date.now() < drawTime && lastKeepTime > state.game.start) {
        const text = formatTime(new Date(drawTime));
        label.innerHTML = `You may not draw ticket until ${text}.`;
    } else {
        label.innerHTML = `You may draw ticket now.`;
    }
}

function formatTime(d) {
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
}

async function init() {
    try {
        const [listRes, stateRes] = await Promise.all([
            fetch("api/ticket-list"),
            fetch("api/state"),
        ]);

        if (!listRes.ok) throw new Error(`Error in ticket-list: ${await listRes.text()}`);
        if (!stateRes.ok) throw new Error(`Error in state: ${await stateRes.text()}`);

        ticketList = await listRes.json();
        state = await stateRes.json();

        setTimeLabel();

        renderTickets();
    } catch (e) {
        alert(e.message);
        throw e;
    }
}

init();
