const COLOUR_MAP = {
    red:      { name: 'Red',    fill: '#e53e3e', stroke: '#c53030' },
    blue:     { name: 'Blue',   fill: '#3182ce', stroke: '#2b6cb0' },
    yellow:   { name: 'Yellow', fill: '#d69e2e', stroke: '#b7791f' },
    green:    { name: 'Green',  fill: '#38a169', stroke: '#276749' },
    black:    { name: 'Black',  fill: '#2d3748', stroke: '#1a202c' },
    purple:   { name: 'Purple', fill: '#805ad5', stroke: '#6b46c1' },
    orange:   { name: 'Orange', fill: '#dd6b20', stroke: '#c05621' },
    pink:     { name: 'Pink',   fill: '#d53f8c', stroke: '#b83280' },
    white:    { name: 'White',  fill: '#e2e8f0', stroke: '#a0aec0' },
    null:     { name: 'Neutral', fill: '#a0aec0', stroke: '#718096' },
    wild:     { name: 'Wild',   fill: 'linear-gradient(45deg, #e53e3e, #3182ce, #d69e2e, #38a169)', stroke: '#4a5568' }
};

// Global State
let selectedCards = {}; 
let playerInventory = {}; // Simulated player card counts from server
let routeData = null;
let locationsData = null;

async function initClaimPage() {
    const appEl = document.getElementById('app');
    const urlParams = new URLSearchParams(window.location.search);
    const routeIndex = urlParams.get('route');

    if (routeIndex === null) {
        appEl.innerHTML = `<div class="error-msg">No route selected. Go back to the map.</div>`;
        return;
    }

    try {
        // Fetching map setup
        const dataRes = await fetch("api/map");
        if (!dataRes.ok) throw new Error("Could not load data");

        const data = await dataRes.json();
        locationsData = data.locations;
        routeData = data.routes[parseInt(routeIndex)];

        if (!routeData) {
            appEl.innerHTML = `<div class="error-msg">Route index #${routeIndex} not found.</div>`;
            return;
        }

        // Mocking user inventory structure from your game architecture
        // (Replace this or pull it from an actual user session endpoint like `api/user/hand`)
        playerInventory = data.playerHand || {
            red: 5, blue: 2, yellow: 1, green: 4, black: 0, 
            purple: 6, orange: 3, pink: 2, white: 1, wild: 4
        };

        // Determine which counters to render
        let trackingColours = [];
        const isNeutralRoute = routeData.colours.includes(null);

        if (isNeutralRoute) {
            // "null" route: include all colors except 'null' itself, plus wild
            trackingColours = Object.keys(COLOUR_MAP).filter(c => c !== 'null');
        } else {
            // Regular colored route: explicit track color choices + wild
            trackingColours = [...new Set(routeData.colours), 'wild'];
        }

        // Initialize chosen counter allocations
        trackingColours.forEach(c => {
            selectedCards[c] = 0;
        });

        renderPage(routeIndex, trackingColours);

    } catch (err) {
        console.error(err);
        appEl.innerHTML = `<div class="error-msg">Error loading configurations.</div>`;
    }
}

function updateCounter(colour, change) {
    const current = selectedCards[colour] || 0;
    const owned = playerInventory[colour] || 0;
    const target = current + change;

    // Front-end constraint: Only check if target count violates raw pool quantities owned
    if (target < 0 || target > owned) return;

    selectedCards[colour] = target;

    const valEl = document.getElementById(`count-${colour}`);
    if (valEl) {
        valEl.textContent = `${target}/${owned}`;
    }
}

function renderPage(routeIndex, trackingColours) {
    const fromLoc = locationsData[routeData.from];
    const toLoc = locationsData[routeData.to];

    const pipHTML = routeData.colours.map(c => {
        const config = COLOUR_MAP[c] || COLOUR_MAP[null];
        return `<span class="panel-colour-pip" style="background:${config.fill};border:1px solid ${config.stroke}" title="${config.name}"></span>`;
    }).join('');

    const countersHTML = trackingColours.map(c => {
        const config = COLOUR_MAP[c];
        const isWild = c === 'wild';
        const bgStyle = isWild ? `background:${config.fill}` : `background:${config.fill}; border:1px solid ${config.stroke}`;
        const owned = playerInventory[c] || 0;

        return `
            <div class="counter-row">
            <div class="counter-label">
            <span class="panel-colour-pip" style="${bgStyle}"></span>
            <span>${config.name}</span>
            </div>
            <div class="counter-controls">
            <button class="btn-step" onclick="updateCounter('${c}', -1)">-</button>
            <span class="counter-value" id="count-${c}">0/${owned}</span>
            <button class="btn-step" onclick="updateCounter('${c}', 1)">+</button>
            </div>
            </div>
            `;
    }).join('');

    document.getElementById('app').innerHTML = `
        <a class="btn-back" href="map.html">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Map
        </a>

        <div class="panel-route-header">
        <span>${fromLoc.name}</span>
        <svg class="panel-route-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
        <span>${toLoc.name}</span>
        </div>

        <div class="panel-route-meta">
        <span class="panel-route-length">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3h18M3 3v18"></path>
        <polyline points="3 21 21 3"></polyline>
        </svg>
        Length&nbsp;<strong>${routeData.length}</strong>
        </span>
        <span class="panel-colour-pips">${pipHTML}</span>
        </div>

        <div class="counters-grid">
        ${countersHTML}
        </div>

        <button class="btn-claim" onclick="submitClaim(${routeIndex})">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Claim route
        </button>
        `;
}

async function submitClaim(routeIndex) {
    // Pack selected quantities into a simplified payload to be evaluated by the server
    const payload = {
        routeIndex: parseInt(routeIndex),
        cardsUsed: {}
    };

    // Filter out items where count is 0 to keep request payload lean
    Object.entries(selectedCards).forEach(([color, count]) => {
        if (count > 0) payload.cardsUsed[color] = count;
    });

    try {
        // Send choice to your server backend setup for length/match validation 
        const response = await fetch("api/claim-route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Server side validation failed.");
        }

        alert("Route successfully claimed!");
        window.location.href = "map.html";

    } catch (err) {
        alert(`Could not claim route: ${err.message}`);
    }
}

window.addEventListener('DOMContentLoaded', initClaimPage);
