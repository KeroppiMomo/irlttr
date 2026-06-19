const GAME_START_KEY = 'game_start_time';
const LOG_KEY        = 'game_log';
const TEAM_NAMES_KEY = 'team_names';

let currentTeam = localStorage.getItem('my_team') || '';
let isEditingName = false;

function getTeamNames() {
    try { return JSON.parse(localStorage.getItem(TEAM_NAMES_KEY)) || {}; } catch { return {}; }
}
function saveTeamName(team, name) {
    const names = getTeamNames(); names[team] = name;
    localStorage.setItem(TEAM_NAMES_KEY, JSON.stringify(names));
}
function getTeamName(team) {
    if (!team) return '—';
    return getTeamNames()[team] || capitalize(team) + ' Team';
}
function getLog() { try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; } catch { return []; } }
function saveLog(log) { localStorage.setItem(LOG_KEY, JSON.stringify(log)); }
function getGameStart() {
    const v = localStorage.getItem(GAME_START_KEY);
    if (!v) { const now = Date.now(); localStorage.setItem(GAME_START_KEY, now); return now; }
    return parseInt(v, 10);
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

const gameStart = getGameStart();
function updateTimer() {
    const elapsed = Math.floor((Date.now() - gameStart) / 1000);
    const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60;
    document.getElementById('timerDisplay').textContent =
        String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}
setInterval(updateTimer, 1000);
updateTimer();

function onTeamChange() {
    currentTeam = document.getElementById('teamSelect').value;
    localStorage.setItem('my_team', currentTeam);
    applyTeamTheme();
    updateNameDisplay();
    if (isEditingName) cancelNameEdit();
}
function applyTeamTheme() { document.body.className = currentTeam ? 'team-' + currentTeam : ''; }
function updateNameDisplay() {
    document.getElementById('teamNameDisplay').textContent = currentTeam ? getTeamName(currentTeam) : '—';
}

function toggleNameEdit() { if (!currentTeam) return; isEditingName ? saveNameEdit() : startNameEdit(); }
function startNameEdit() {
    isEditingName = true;
    document.getElementById('teamNameDisplay').style.display = 'none';
    const input = document.getElementById('teamNameInput');
    input.style.display = 'block'; input.value = getTeamName(currentTeam); input.focus(); input.select();
    document.getElementById('changeNameBtn').textContent = 'Save';
    input.onkeydown = (e) => { if (e.key === 'Enter') saveNameEdit(); if (e.key === 'Escape') cancelNameEdit(); };
}
function saveNameEdit() {
    const name = document.getElementById('teamNameInput').value.trim();
    if (name && currentTeam) saveTeamName(currentTeam, name);
    finishNameEdit();
}
function cancelNameEdit() { finishNameEdit(); }
function finishNameEdit() {
    isEditingName = false;
    document.getElementById('teamNameDisplay').style.display = '';
    document.getElementById('teamNameInput').style.display = 'none';
    document.getElementById('changeNameBtn').textContent = 'Change name';
    updateNameDisplay();
}

function renderLog() {
    const area = document.getElementById('logArea'), empty = document.getElementById('logEmpty');
    const log = getLog();
    area.querySelectorAll('.log-entry').forEach(e => e.remove());
    if (log.length === 0) { empty.style.display = ''; return; }
    empty.style.display = 'none';
    log.slice().reverse().forEach(entry => {
        const div = document.createElement('div'); div.className = 'log-entry';
        const timeSpan = document.createElement('span'); timeSpan.className = 'log-time'; timeSpan.textContent = entry.time;
        const tag = document.createElement('span'); tag.className = 'log-team-tag ' + (entry.team || ''); tag.textContent = entry.teamLabel || '?';
        const text = document.createElement('span'); text.className = 'log-text'; text.textContent = entry.text;
        div.appendChild(timeSpan); div.appendChild(tag); div.appendChild(text);
        area.insertBefore(div, area.firstChild);
    });
}

function addLogEntry() {
    const input = document.getElementById('logInput'), warning = document.getElementById('noTeamWarning');
    const text = input.value.trim(); if (!text) return;
    if (!currentTeam) { warning.style.display = ''; setTimeout(() => warning.style.display = 'none', 3000); return; }
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    const log = getLog();
    log.push({ time: timeStr, team: currentTeam, teamLabel: getTeamName(currentTeam), text });
    saveLog(log); input.value = ''; renderLog();
}

setInterval(renderLog, 5000);

(function init() {
    if (currentTeam) { document.getElementById('teamSelect').value = currentTeam; applyTeamTheme(); }
    updateNameDisplay();
    renderLog();
})();
