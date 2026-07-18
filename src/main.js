import versionData from '../version.json';
const { version, lastUpdated, isSignificant } = versionData;

import settingsManager from './settings.js';
import { clanFilter, leaderboardFilter } from "./clanFilters.js";
import WindowManager from "./windowManager.js";
import donationsTracker from "./donationsTracker.js";
import winCounter from "./winCounter.js";
import playerList from "./playerList.js";
import gameScriptUtils from "./gameScriptUtils.js";
import hoveringTooltip from "./hoveringTooltip.js";
import { keybindFunctions, keybindHandler, mobileKeybinds } from "./keybinds.js";
import customLobby from './customLobby.js';
import trainer from './trainer.js';
import tickDelay from './tickDelay.js';
import './replayScrubber.js';
import { displayChangelog } from './changelog.js';
import { reportError } from './debugging.js';

window.__fx = window.__fx || {};
const __fx = window.__fx;

// Pause/resume the game loop by intercepting RAF, setInterval, and performance.now.
// Freezing performance.now() prevents the game's delta-time from accumulating
// during the pause, which would otherwise cause it to fast-forward on resume
// and skip tick 0 (breaking the snapshot).
{
  let _paused = false;
  let _pausedAtReal = 0;   // real performance.now() at pause time
  let _totalPaused = 0;    // total ms paused so far (used to offset time)

  const _origRAF     = window.requestAnimationFrame.bind(window);
  const _origSet     = window.setInterval.bind(window);
  const _origPerfNow = performance.now.bind(performance);

  // Game sees time frozen during pause, then resumes from where it left off
  performance.now = function() {
    if (_paused) return _pausedAtReal - _totalPaused;
    return _origPerfNow() - _totalPaused;
  };

  // Wrap RAF: always execute but with corrected time — keeps canvas rendering
  // (escape menus, etc.) working while paused. Game logic doesn't advance
  // because performance.now() is frozen, so delta-time = 0 in each frame.
  window.requestAnimationFrame = function rafWrap(cb) {
    return _origRAF(function(time) {
      cb(time - _totalPaused);
    });
  };

  // Wrap setInterval: skip execution while paused (interval keeps ticking, no catch-up)
  window.setInterval = function(fn, delay, ...args) {
    return _origSet(function() { if (!_paused) fn(...args); }, delay);
  };

  __fx.pauseGame = function() {
    if (_paused) return;
    _paused = true;
    _pausedAtReal = _origPerfNow();
  };
  __fx.resumeGame = function() {
    if (!_paused) return;
    _totalPaused += _origPerfNow() - _pausedAtReal;
    _paused = false;
  };
}
__fx.version = version + " " + lastUpdated;
__fx.isCustomLobbyVersion = window.location.href.startsWith("https://fxclient.github.io/custom-lobbies")

const savedVersion = localStorage.getItem("fx_version");
if (savedVersion !== version && !__fx.isCustomLobbyVersion) {
  localStorage.setItem("fx_version", version);
  if (savedVersion !== null && isSignificant) displayChangelog();
}

__fx.settingsManager = settingsManager;
__fx.leaderboardFilter = leaderboardFilter;
__fx.utils = gameScriptUtils;
__fx.WindowManager = WindowManager;
__fx.keybindFunctions = keybindFunctions;
__fx.keybindHandler = keybindHandler;
__fx.mobileKeybinds = mobileKeybinds;
__fx.donationsTracker = donationsTracker;
__fx.reportError = reportError;
__fx.playerList = playerList;
__fx.hoveringTooltip = hoveringTooltip;
__fx.clanFilter = clanFilter;
__fx.wins = winCounter;
__fx.customLobby = customLobby;
__fx.trainer = trainer;
__fx.tickDelay = tickDelay;

__fx.selectMap = (type, idx) => {
  if (window.aE?.data) {
    window.aE.data.mapType = type;
    window.aE.data.mapProceduralIndex = idx;
  }
  // aTO() touches the custom scenario UI which may not exist yet — ignore if so
  try { window.__fx_aTO?.(); } catch(e) {}
};

console.log('Successfully loaded FX Client');
