// Replay progress scrubber: drag to seek forward or backward.
// Uses window.__fx_replayTick / __fx_replayTotal (exposed by patches.js)
// and window.__fx_replaySpeedIdx (override read each tick in patches.js).

const SCRUBBER_H = 18;

// ── DOM ──────────────────────────────────────────────────────────────────────
const wrap = document.createElement('section');
wrap.style.cssText = [
    'position:fixed', 'bottom:0', 'left:0', 'right:0',
    `height:${SCRUBBER_H}px`,
    'background:rgba(0,0,0,0.65)',
    'display:none', 'z-index:9999',
    'user-select:none', 'box-sizing:border-box',
    'pointer-events:none',  // let game clicks pass through; we use window listeners
].join(';');

const track = document.createElement('div');
track.style.cssText = 'position:absolute;top:50%;left:6px;right:6px;height:4px;transform:translateY(-50%);background:rgba(255,255,255,0.2);border-radius:2px;';

const fill = document.createElement('div');
fill.style.cssText = 'height:100%;width:0%;background:#4af;border-radius:2px;pointer-events:none;';

const knob = document.createElement('div');
knob.style.cssText = [
    'position:absolute', 'top:50%', 'width:12px', 'height:12px',
    'background:#fff', 'border-radius:50%',
    'transform:translate(-50%,-50%)',
    'pointer-events:none',
    'transition:transform 0.05s',
    'box-shadow:0 0 3px rgba(0,0,0,0.6)',
].join(';');

track.appendChild(fill);
track.appendChild(knob);
wrap.appendChild(track);
document.body.appendChild(wrap);

// ── State ────────────────────────────────────────────────────────────────────
let _dragActive   = false;
let _dragProgress = null;   // visual-only during drag, null otherwise
let _seekTarget   = null;   // 0-1 target after seek fires, null when idle
let _restartDone  = false;  // guard: did we already restart for backwards seek?

// ── Helpers ──────────────────────────────────────────────────────────────────
function isReplay() { return !!window.aE?.hI; }

function replayProgress() {
    const tick  = window.__fx_replayTick  ?? 0;
    const total = window.__fx_replayTotal ?? window.aE?.a5b ?? 1;
    return total > 0 ? tick / total : 0;
}

function setSpeedMax()   { window.__fx_replaySpeedIdx = 0;    } // 10x
function clearSpeedIdx() { window.__fx_replaySpeedIdx = null; } // restore game control

function progressFromPointer(e) {
    const rect = track.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
}

// ── Seek logic ───────────────────────────────────────────────────────────────
function startSeek(targetP) {
    const current = replayProgress();
    _seekTarget = targetP;

    if (targetP < current - 0.005) {
        // Need to restart then fast-forward
        _restartDone = false;
        clearSpeedIdx();
        window.__fx.restartGame?.();
        // Give the game one frame to register the restart, then start fast-forward
        setTimeout(() => {
            _restartDone = true;
            if (_seekTarget !== null) setSpeedMax();
        }, 80);
    } else {
        _restartDone = true;
        setSpeedMax();
    }
}

function tickSeek() {
    if (_seekTarget === null) return;
    if (!_restartDone) return;
    // Don't stop during spawn phase — wait until main game starts
    if (window.__fx_replayPhase !== 1) return;
    const current = replayProgress();
    if (current >= _seekTarget - 0.003) {
        clearSpeedIdx();
        _seekTarget  = null;
        _restartDone = false;
    }
}

// ── Drag events ──────────────────────────────────────────────────────────────
function inScrubberZone(e) {
    return isReplay() && wrap.style.display !== 'none' && e.clientY >= window.innerHeight - SCRUBBER_H;
}

window.addEventListener('mousedown', (e) => {
    if (!inScrubberZone(e)) return;
    _dragActive   = true;
    _dragProgress = progressFromPointer(e);
    e.stopPropagation(); // prevent game from handling this click
}, true); // capture phase so we run before game handlers

window.addEventListener('mousemove', (e) => {
    if (!_dragActive) return;
    _dragProgress = progressFromPointer(e);
});

window.addEventListener('mouseup', (e) => {
    if (!_dragActive) return;
    const target  = progressFromPointer(e);
    _dragActive   = false;
    _dragProgress = null;
    startSeek(target);
});

// Touch support
window.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (!inScrubberZone(t)) return;
    _dragActive   = true;
    _dragProgress = progressFromPointer(t);
    e.stopPropagation();
}, { passive: true, capture: true });

window.addEventListener('touchmove', (e) => {
    if (!_dragActive) return;
    _dragProgress = progressFromPointer(e.touches[0]);
}, { passive: true });

window.addEventListener('touchend', (e) => {
    if (!_dragActive) return;
    const target  = progressFromPointer(e.changedTouches[0]);
    _dragActive   = false;
    _dragProgress = null;
    startSeek(target);
});

// ── RAF loop ─────────────────────────────────────────────────────────────────
function loop() {
    requestAnimationFrame(loop);

    if (!isReplay()) {
        if (wrap.style.display !== 'none') {
            wrap.style.display = 'none';
            // Clean up any in-progress seek when leaving replay
            clearSpeedIdx();
            _seekTarget  = null;
            _dragActive  = false;
            _dragProgress = null;
        }
        return;
    }

    wrap.style.display = 'block';
    tickSeek();

    const displayP = _dragProgress ?? (_seekTarget !== null ? _seekTarget : replayProgress());
    const pct      = (displayP * 100).toFixed(2) + '%';
    fill.style.width = pct;
    knob.style.left  = pct;
}

requestAnimationFrame(loop);
