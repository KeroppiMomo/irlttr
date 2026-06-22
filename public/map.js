const SVG_NS = 'http://www.w3.org/2000/svg';
// ════════════════════════════════════════════════
// Board data
// ════════════════════════════════════════════════
let locations;
let routes;

// ════════════════════════════════════════════════
// Colour mapping
// ════════════════════════════════════════════════
const COLOUR_MAP = {
    null:     { fill: '#a0aec0', stroke: '#718096' },
    red:      { fill: '#e53e3e', stroke: '#c53030' },
    blue:     { fill: '#3182ce', stroke: '#2b6cb0' },
    yellow:   { fill: '#d69e2e', stroke: '#b7791f' },
    green:    { fill: '#38a169', stroke: '#276749' },
    black:    { fill: '#2d3748', stroke: '#1a202c' },
    purple:   { fill: '#805ad5', stroke: '#6b46c1' },
    orange:   { fill: '#dd6b20', stroke: '#c05621' },
    pink:     { fill: '#d53f8c', stroke: '#b83280' },
    white:    { fill: '#e2e8f0', stroke: '#a0aec0' },
};

function colourStyle(c) {
    return COLOUR_MAP[c] || COLOUR_MAP[null];
}

// ════════════════════════════════════════════════
// Build overlay SVG content
// ════════════════════════════════════════════════

// Segment dimensions (in SVG units) — these are the *maximum* values;
// segments are scaled down if the route is shorter than needed.
const SEG_W = 4.2;
const SEG_H = 1.5;
const SEG_GAP = 0.7;
const ROUTE_OFFSET = 1; // perpendicular offset for double routes

// Padding reserved at each end of the route for the node circle
const NODE_RADIUS = 0.8;
const ROUTE_END_PAD = NODE_RADIUS + 0.6; // a little breathing room past the dot edge

// Scale threshold above which full name is shown instead of index
const LABEL_FULL_NAME_THRESHOLD = 3;

// Cache of vertex SVG positions, populated once after SVG is loaded
let vertexPositions = null; // array indexed by vertex number

function getVertexPositions() {
    if (vertexPositions) return vertexPositions;
    vertexPositions = [];
    locations.forEach((_, i) => {
        const el = document.querySelector(`#layer3 circle[inkscape\\:label="v${i}"`);
        if (!el) {
            vertexPositions[i] = { x: 0, y: 0 };
            return;
        }

        let cx = parseFloat(el.getAttribute('cx'));
        let cy = parseFloat(el.getAttribute('cy'));
        // Some circles use transform="scale(1,-1)" with a negated cy
        const t = el.getAttribute('transform');
        if (t && t.includes('scale(1,-1)')) cy = -cy;
        vertexPositions[i] = { x: cx, y: cy };
    });
    return vertexPositions;
}

function buildOverlay() {
    const svgEl = document.getElementById('overlay');
    svgEl.innerHTML = '';

    const positions = getVertexPositions();

    // ── Routes ──
    routes.forEach(route => {
        const from = positions[route.from];
        const to   = positions[route.to];
        if (!from || !to) return;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        // Unit vectors
        const ux =  dx / dist;
        const uy =  dy / dist;
        const px = -uy;  // unit perpendicular
        const py =  ux;

        // Available length between the two node circles
        const available = dist - 2 * ROUTE_END_PAD;
        if (available <= 0) return; // nodes are on top of each other

        // Ideal total length for all segments + gaps
        const n = route.length;
        const idealTotal = n * SEG_W + (n - 1) * SEG_GAP;

        // Scale segments down if they would overflow the available space
        const scaleFactor = idealTotal > available ? available / idealTotal : 1;
        const segW   = SEG_W   * scaleFactor;
        const segGap = SEG_GAP * scaleFactor;
        const segH   = SEG_H;  // height doesn't need scaling

        // Recompute actual total after scaling
        const totalLen = n * segW + (n - 1) * segGap;

        route.colours.forEach((colour, ci) => {
            const style = colourStyle(colour);
            const isDbl = route.colours.length === 2;
            const sign  = isDbl ? (ci === 0 ? -1 : 1) : 0;
            const ox = sign * px * ROUTE_OFFSET;
            const oy = sign * py * ROUTE_OFFSET;

            // Centre of the route segment strip (between the two nodes)
            const midX = (from.x + to.x) / 2 + ox;
            const midY = (from.y + to.y) / 2 + oy;

            for (let i = 0; i < n; i++) {
                // Position of this segment's centre along the route axis
                const offset = -totalLen / 2 + i * (segW + segGap) + segW / 2;
                const sx = midX + ux * offset;
                const sy = midY + uy * offset;

                const rect = document.createElementNS(SVG_NS, 'rect');
                rect.setAttribute('x', sx - segW / 2);
                rect.setAttribute('y', sy - segH / 2);
                rect.setAttribute('width',  segW);
                rect.setAttribute('height', segH);
                rect.setAttribute('rx', 0.2 * scaleFactor);
                rect.setAttribute('ry', 0.2 * scaleFactor);
                rect.setAttribute('fill',         style.fill);
                rect.setAttribute('stroke',       style.stroke);
                rect.setAttribute('stroke-width', 0.3);
                rect.setAttribute('opacity',      0.92);
                rect.setAttribute('transform', `rotate(${angle},${sx},${sy})`);
                svgEl.appendChild(rect);
            }
        });
    });

    // ── Location dots + labels ──
    locations.forEach((loc, i) => {
        const { x, y } = positions[i];
        const g = document.createElementNS(SVG_NS, 'g');

        g.id = `overlayV${i}`;

        const originalDot = document.querySelector(`#layer3 circle[inkscape\\:label="v${i}"`);
        originalDot.setAttribute("visibility", "hidden");

        // Inner dot
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('fill', originalDot.style.fill);
        g.appendChild(dot);

        // Label — index only when small, "N. Name" when zoomed in
        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-family', "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
        label.setAttribute('font-weight', '600');
        label.setAttribute('paint-order', 'stroke');
        label.setAttribute('stroke',           'rgba(255,255,255,0.9)');
        label.setAttribute('stroke-linejoin',  'round');
        label.setAttribute('fill', '#1a202c');

        g.appendChild(label);
        svgEl.appendChild(g);
    });
    
    updateOverlay();
}

function updateOverlay() {
    const showFullName = scale >= LABEL_FULL_NAME_THRESHOLD;

    locations.forEach((loc, i) => {
        const dot = document.querySelector(`#overlayV${i} circle`);
        const label = document.querySelector(`#overlayV${i} text`);

        dot.setAttribute('r',  1.5/Math.max(1, Math.pow(scale, 0.7)));

        if (showFullName) {
            label.setAttribute('font-size', 4/scale);
            label.setAttribute('stroke-width', 1/scale);
            label.setAttribute('transform', `translate(0, ${-6/scale})`);
            label.textContent = `${i}. ${loc.name}`;
        } else {
            label.setAttribute('font-size', '3');
            label.setAttribute('stroke-width', '1');
            label.setAttribute('transform', `translate(0, -2)`);
            label.textContent = `${i}`;
        }
    });
}

// ════════════════════════════════════════════════
// Tooltip
// ════════════════════════════════════════════════
const tooltip = document.getElementById('tooltip');

function showTooltip(e, name) {
    tooltip.textContent = name;
    tooltip.classList.add('visible');
    moveTooltip(e);
}
function moveTooltip(e) {
    const vw = window.innerWidth;
    const tw = tooltip.offsetWidth;
    let left = e.clientX + 12;
    let top  = e.clientY - 36;
    if (left + tw > vw - 8) left = e.clientX - tw - 12;
    if (top < 8) top = e.clientY + 12;
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
}
function hideTooltip() {
    tooltip.classList.remove('visible');
}

// ════════════════════════════════════════════════
// Pan & Zoom state
// ════════════════════════════════════════════════
const SVG_W = 242.12695;
const SVG_H = 184.49562;
const MAP_PIXEL_W = 900; // render size in px
const MAP_PIXEL_H = MAP_PIXEL_W * (SVG_H / SVG_W);

let scale = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let panStart  = { x: 0, y: 0 };

// Pinch
let lastPinchDist = null;
let pinchCenter = { x: 0, y: 0 };

const viewport = document.getElementById('map-viewport');
const canvas   = document.getElementById('map-canvas');

function applyTransform() {
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    updateOverlay();
}

function clampPan() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const cw = MAP_PIXEL_W * scale;
    const ch = MAP_PIXEL_H * scale;

    // Allow some overscroll (30% of viewport)
    const marginX = Math.max(vw * 0.3, 40);
    const marginY = Math.max(vh * 0.3, 40);

    panX = Math.min(marginX, Math.max(panX, vw - cw - marginX));
    panY = Math.min(marginY, Math.max(panY, vh - ch - marginY));
}

function zoomToward(cx, cy, newScale) {
    // Zoom centred on (cx, cy) in viewport coordinates
    const ratio = newScale / scale;
    panX = cx - ratio * (cx - panX);
    panY = cy - ratio * (cy - panY);
    scale = newScale;
    clampPan();
    applyTransform();
}

function resetView() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    scale = Math.min(vw / MAP_PIXEL_W, vh / MAP_PIXEL_H) * 0.96;
    panX = (vw - MAP_PIXEL_W * scale) / 2;
    panY = (vh - MAP_PIXEL_H * scale) / 2;
    applyTransform();
}

// ── Mouse events ──
viewport.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    panStart  = { x: panX, y: panY };
    viewport.classList.add('dragging');
});

window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    panX = panStart.x + (e.clientX - dragStart.x);
    panY = panStart.y + (e.clientY - dragStart.y);
    clampPan();
    applyTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    viewport.classList.remove('dragging');
});

// ── Scroll wheel zoom ──
viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.91;
    const newScale = Math.min(8, Math.max(0.25, scale * delta));
    zoomToward(e.clientX - viewport.getBoundingClientRect().left,
        e.clientY - viewport.getBoundingClientRect().top,
        newScale);
}, { passive: false });

// ── Touch events ──
viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        isDragging = true;
        dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        panStart  = { x: panX, y: panY };
    } else if (e.touches.length === 2) {
        isDragging = false;
        lastPinchDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY
        );
        const rect = viewport.getBoundingClientRect();
        pinchCenter = {
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
        };
    }
}, { passive: true });

viewport.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
        panX = panStart.x + (e.touches[0].clientX - dragStart.x);
        panY = panStart.y + (e.touches[0].clientY - dragStart.y);
        clampPan();
        applyTransform();
    } else if (e.touches.length === 2 && lastPinchDist !== null) {
        const newDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY
        );
        const ratio = newDist / lastPinchDist;
        const newScale = Math.min(8, Math.max(0.25, scale * ratio));
        zoomToward(pinchCenter.x, pinchCenter.y, newScale);
        lastPinchDist = newDist;
    }
}, { passive: false });

viewport.addEventListener('touchend', e => {
    if (e.touches.length < 2) lastPinchDist = null;
    if (e.touches.length === 0) isDragging = false;
}, { passive: true });

// ── Button controls ──
document.getElementById('btnZoomIn').addEventListener('click', () => {
    const cx = viewport.clientWidth / 2;
    const cy = viewport.clientHeight / 2;
    zoomToward(cx, cy, Math.min(8, scale * 1.35));
});
document.getElementById('btnZoomOut').addEventListener('click', () => {
    const cx = viewport.clientWidth / 2;
    const cy = viewport.clientHeight / 2;
    zoomToward(cx, cy, Math.max(0.25, scale / 1.35));
});
document.getElementById('btnReset').addEventListener('click', resetView);

// ════════════════════════════════════════════════
// Init
// ════════════════════════════════════════════════
async function init() {

    const [svgRes, dataRes] = await Promise.all([
        fetch("map.svg"),
        fetch("api/map"),
    ]);
    if (!svgRes.ok) {
        alert("Could not load map");
        console.error(svgRes);
        throw new Error("Could not load map");
    }
    if (!dataRes.ok) {
        alert("Could not load data");
        console.error(dataRes);
        throw new Error("Could not load data");
    }

    const SVG_CONTENT = await svgRes.text();
    canvas.innerHTML = SVG_CONTENT;
    vertexPositions = null; // reset cache — SVG DOM just changed

    // Inject map SVG
    const mapSVG = canvas.querySelector('svg');
    mapSVG.setAttribute('width',  MAP_PIXEL_W);
    mapSVG.setAttribute('height', MAP_PIXEL_H);
    mapSVG.style.position = 'absolute';
    mapSVG.style.top = '0';
    mapSVG.style.left = '0';

    // Create overlay SVG
    const overlayContainer = document.createElementNS(SVG_NS, 'svg');
    overlayContainer.setAttribute('id', 'overlayContainer');
    overlayContainer.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
    overlayContainer.setAttribute('width',  MAP_PIXEL_W);
    overlayContainer.setAttribute('height', MAP_PIXEL_H);
    overlayContainer.style.position = 'absolute';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    canvas.appendChild(overlayContainer);

    const overlayEl = document.createElementNS(SVG_NS, 'g');
    overlayEl.setAttribute('id', 'overlay');
    overlayEl.setAttribute('transform', document.getElementById("layer3").getAttribute('transform'));
    overlayContainer.appendChild(overlayEl);

    const data = await dataRes.json();
    locations = data.locations;
    routes = data.routes;

    buildOverlay();
    resetView();
}

window.addEventListener('resize', resetView);
init();
