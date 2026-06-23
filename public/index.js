const GAME_START_KEY = 'game_start_time';
const LOG_KEY        = 'game_log';
const TEAM_NAMES_KEY = 'team_names';

let currentTeam = localStorage.getItem('my_team') || '';
let isEditingName = false;

let state;
function updateTimer() {
    const gameStart = state.game.start;
    let text = "--:--:--";
    if (gameStart !== null) {
        const elapsed = Math.floor((Date.now() - gameStart) / 1000);
        const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60;
        text = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }
    document.getElementById('timerDisplay').textContent = text;
}

function applyTeamTheme() { document.body.className = currentTeam ? 'team-' + currentTeam : ''; }
function onTeamChange() {
    currentTeam = document.getElementById('teamSelect').value;
    localStorage.setItem('my_team', currentTeam);
    applyTeamTheme();
}

setTimeout(updateTimer, 1000);

(async function init() {
    if (currentTeam) { document.getElementById('teamSelect').value = currentTeam; applyTeamTheme(); }

    const res = await fetch("api/state");
    state = await res.json();

    updateTimer();
})();
