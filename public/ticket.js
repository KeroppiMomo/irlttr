const TEAM_NAMES_KEY = 'team_names';
const TICKETS_KEY    = 'tickets';

const currentTeam = localStorage.getItem('my_team') || '';

function getTeamNames() { try { return JSON.parse(localStorage.getItem(TEAM_NAMES_KEY)) || {}; } catch { return {}; } }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function getTeamName(team) { return getTeamNames()[team] || capitalize(team) + ' Team'; }

function ticketKey() { return TICKETS_KEY + '_' + (currentTeam || 'none'); }
function getTickets() { try { return JSON.parse(localStorage.getItem(ticketKey())) || []; } catch { return []; } }
function saveTickets(t) { localStorage.setItem(ticketKey(), JSON.stringify(t)); }

if (currentTeam) document.body.className = 'team-' + currentTeam;

function toggleDone(id) {
    const tickets = getTickets();
    const t = tickets.find(t => t.id === id);
    if (!t) return;
    if (t.done) {
        t.done = false; t.completedAt = null;
    } else {
        t.done = true;
        const now = new Date();
        t.completedAt = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    }
    saveTickets(tickets);
    renderTickets();
}

function deleteTicket(id) {
    const tickets = getTickets().filter(t => t.id !== id);
    saveTickets(tickets);
    renderTickets();
}

function renderTickets() {
    const tickets = getTickets();
    const empty = document.getElementById('ticketEmpty');
    const table = document.getElementById('ticketTable');
    const tbody = document.getElementById('ticketBody');

    if (tickets.length === 0) {
        empty.style.display = '';
        table.style.display = 'none';
        return;
    }
    empty.style.display = 'none';
    table.style.display = '';
    tbody.innerHTML = '';

    tickets.forEach(t => {
        const tr = document.createElement('tr');
        if (t.done) tr.classList.add('completed');

        const tdStatus = document.createElement('td');
        const iconBtn = document.createElement('button');
        iconBtn.className = 'status-icon ' + (t.done ? 'done' : 'todo');
        iconBtn.title = t.done ? 'Mark as incomplete' : 'Mark as complete';
        iconBtn.setAttribute('aria-label', t.done ? 'Mark as incomplete' : 'Mark as complete');
        iconBtn.innerHTML = t.done
            ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        iconBtn.onclick = () => toggleDone(t.id);
        tdStatus.appendChild(iconBtn);
        if (t.done && t.completedAt) {
            const timeSpan = document.createElement('span');
            timeSpan.className = 'completion-time';
            timeSpan.textContent = t.completedAt;
            tdStatus.appendChild(timeSpan);
        }

        const tdPoints = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'points-badge';
        badge.textContent = t.points;
        tdPoints.appendChild(badge);

        const tdFrom = document.createElement('td');
        tdFrom.textContent = t.from;

        const tdArrow = document.createElement('td');
        tdArrow.innerHTML = '<span class="route-arrow">→</span>';

        const tdTo = document.createElement('td');
        tdTo.textContent = t.to;

        const tdDel = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.style.cssText = 'background:none;border:none;cursor:pointer;padding:4px;color:var(--text-muted);opacity:0.5;';
        delBtn.title = 'Remove ticket';
        delBtn.setAttribute('aria-label', 'Remove ticket');
        delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
        delBtn.onmouseenter = () => delBtn.style.opacity = '1';
        delBtn.onmouseleave = () => delBtn.style.opacity = '0.5';
        delBtn.onclick = () => { if (confirm('Remove this ticket?')) deleteTicket(t.id); };
        tdDel.appendChild(delBtn);

        tr.appendChild(tdStatus);
        tr.appendChild(tdPoints);
        tr.appendChild(tdFrom);
        tr.appendChild(tdArrow);
        tr.appendChild(tdTo);
        tr.appendChild(tdDel);
        tbody.appendChild(tr);
    });
}

renderTickets();
