import { getVar, getGameTimeMs } from "./gameInterface.js";
import WindowManager from "./windowManager.js";
import { getSettings } from "./settings.js";

// Each cycle has an `attacks` array: [{ pct, tick, keys? }, ...]
// pct = attack percentage; tick = which tick to click; keys = keybind string (optional)
// Percentages carry over within a game (persisted by the game's attack bar).
const openings = {
  "water-mobile": {
    name: "Water Mobile",
    cycles: [
      { attacks: [{ pct: 36.7, tick: 7 }],                                                                              expectedLand: 144,  expectedTroops: 789   },
      { attacks: [{ pct: 21.9, tick: 8 }],                                                                              expectedLand: 264,  expectedTroops: 1447  },
      { attacks: [{ pct: 15.8, tick: 8 }],                                                                              expectedLand: 420,  expectedTroops: 2666  },
      { attacks: [{ pct: 22.6, tick: 5 }, { pct: 22.6, tick: 7 }, { pct: 22.6, tick: 9 }],                            expectedLand: 1404, expectedTroops: 3603  },
      { attacks: [{ pct: 33.7, tick: 5 }, { pct: 33.7, tick: 7 }, { pct: 33.7, tick: 9 }],                            expectedLand: 3120, expectedTroops: 4995  },
    ]
  },
  "water-3120": {
    name: "Water 3120",
    cycles: [
      { attacks: [{ pct: 20.9, tick: 7, keys: "sssssssdd" }, { pct: 17.7, tick: 9, keys: "sa" }],                                          expectedLand: 144,  expectedTroops: 799  },
      { attacks: [{ pct: 21.6, tick: 8, keys: "wdd" }],                                                                                      expectedLand: 264,  expectedTroops: 1466 },
      { attacks: [{ pct: 15.5, tick: 8, keys: "ssaa" }],                                                                                     expectedLand: 420,  expectedTroops: 2699 },
      { attacks: [{ pct: 18.9, tick: 5, keys: "wdd" }, { pct: 24.7, tick: 7, keys: "ww" }, { pct: 24.7, tick: 9 }],                        expectedLand: 1404, expectedTroops: 3672 },
      { attacks: [{ pct: 27.1, tick: 5, keys: "ddd" }, { pct: 35.5, tick: 7, keys: "ww" }, { pct: 35.5, tick: 9 }],                        expectedLand: 3120, expectedTroops: 5149 },
    ]
  },
  "sharkie-v3-1": {
    name: "Sharkie V3.1",
    cycles: [
      { attacks: [{ pct: 20.9, tick: 7, keys: "sssssssdd" }, { pct: 17.7, tick: 9, keys: "sa" }],                                                              expectedLand: 144,  expectedTroops: 799  },
      { attacks: [{ pct: 14.6, tick: 8, keys: "saa" }],                                                                                                          expectedLand: 220,  expectedTroops: 1525 },
      { attacks: [{ pct: 12.3, tick: 6, keys: "sa" }, { pct: 27.5, tick: 8, keys: "wwwwww" }],                                                                  expectedLand: 612,  expectedTroops: 2398 },
      { attacks: [{ pct: 22.4, tick: 5, keys: "sdsd" }, { pct: 43.4, tick: 7, keys: "wdwdwdwd" }, { pct: 42.1, tick: 9, keys: "a" }],                          expectedLand: 1860, expectedTroops: 3006 },
      { attacks: [{ pct: 37.0, tick: 5, keys: "aaaa" }, { pct: 57.1, tick: 7, keys: "wwwd" }, { pct: 79.4, tick: 9, keys: "wdwd" }],                           expectedLand: 3784, expectedTroops: 4216 },
    ]
  },
  "sharkie-v2-0": {
    name: "Sharkie V2.0",
    cycles: [
      { attacks: [{ pct: 20.9, tick: 7, keys: "sssssssdd" }, { pct: 17.7, tick: 9, keys: "sa" }],                                          expectedLand: 144,  expectedTroops: 799  },
      { attacks: [{ pct: 14.6, tick: 8, keys: "saa" }],                                                                                      expectedLand: 220,  expectedTroops: 1525 },
      { attacks: [{ pct: 20.9, tick: 6, keys: "wdwdd" }, { pct: 20.9, tick: 8 }],                                                           expectedLand: 612,  expectedTroops: 2376 },
      { attacks: [{ pct: 30.0, tick: 5, keys: "wdwdd" }, { pct: 41.8, tick: 7, keys: "wdwd" }, { pct: 41.8, tick: 9 }],                    expectedLand: 1860, expectedTroops: 2933 },
      { attacks: [{ pct: 36.6, tick: 6, keys: "s" }, { pct: 32.0, tick: 8, keys: "s" }, { pct: 32.0, tick: 9 }],                           expectedLand: 3280, expectedTroops: 4872 },
    ]
  },
  "freddo-v1": {
    name: "Freddo V1",
    cycles: [
      { attacks: [{ pct: 28.2, tick: 7, keys: "sssssddd" }], expectedLand: 112,  expectedTroops: 837  },
      { attacks: [{ pct: 34.5, tick: 7, keys: "wwaa"     }], expectedLand: 312,  expectedTroops: 1371 },
      { attacks: [{ pct: 32.1, tick: 7, keys: "aa"       }], expectedLand: 612,  expectedTroops: 2351 },
      { attacks: [{ pct: 28.2, tick: 5 }, { pct: 36.3, tick: 7 }, { pct: 36.3, tick: 8 }], expectedLand: 1740, expectedTroops: 3018 },
      { attacks: [{ pct: 28.2, tick: 6 }, { pct: 32.1, tick: 8 }, { pct: 32.1, tick: 9 }], expectedLand: 3120, expectedTroops: 4973 },
    ]
  },
  "freddo-v2-0": {
    name: "FreddoV2.0",
    cycles: [
      { attacks: [{ pct: 28.2, tick: 7, keys: "sssssddd" }],                                                                          expectedLand: 112,  expectedTroops: 837  },
      { attacks: [{ pct: 34.5, tick: 7, keys: "wwaa" }],                                                                              expectedLand: 312,  expectedTroops: 1371 },
      { attacks: [{ pct: 32.1, tick: 7, keys: "aa" }],                                                                                expectedLand: 612,  expectedTroops: 2351 },
      { attacks: [{ pct: 42,   tick: 5 }, { pct: 42,   tick: 7 }, { pct: 42,   tick: 9 }],                                          expectedLand: 1860, expectedTroops: 2796 },
      { attacks: [{ pct: 39,   tick: 5 }, { pct: 39,   tick: 7 }, { pct: 39,   tick: 9 }],                                          expectedLand: 3280, expectedTroops: 4633 },
    ]
  },
  "freddo-v2-1": {
    name: "FreddoV2.1",
    cycles: [
      { attacks: [{ pct: 28.2, tick: 7, keys: "sssssddd" }],                                                                          expectedLand: 112,  expectedTroops: 837  },
      { attacks: [{ pct: 34.5, tick: 7, keys: "wwaa" }],                                                                              expectedLand: 312,  expectedTroops: 1371 },
      { attacks: [{ pct: 32.1, tick: 7, keys: "aa" }],                                                                                expectedLand: 612,  expectedTroops: 2351 },
      { attacks: [{ pct: 35,   tick: 5 }, { pct: 42,   tick: 7 }, { pct: 42,   tick: 9 }],                                          expectedLand: 1860, expectedTroops: 2838 },
      { attacks: [{ pct: 39,   tick: 5 }, { pct: 35,   tick: 7 }, { pct: 35,   tick: 9 }],                                          expectedLand: 3280, expectedTroops: 4705 },
    ]
  },
  "greenbiscuit-v1": {
    name: "GreenBiscuit V1",
    cycles: [
      { attacks: [{ pct: 28.2, tick: 7, keys: "sssssddd" }], expectedLand: 112,  expectedTroops: 837  },
      { attacks: [{ pct: 34.5, tick: 7, keys: "wwaa"     }], expectedLand: 312,  expectedTroops: 1371 },
      { attacks: [{ pct: 32.1, tick: 7, keys: "aa"       }], expectedLand: 612,  expectedTroops: 2351 },
      { attacks: [{ pct: 30.7, tick: 7, keys: "a"        }], expectedLand: 1104, expectedTroops: 4034 },
      { attacks: [{ pct: 43.7, tick: 6, keys: "wwdd"     }], expectedLand: 2244, expectedTroops: 6246 },
    ]
  },
  "thigh-v2": {
    name: "Thigh V2",
    cycles: [
      { attacks: [{ pct: 20.9, tick: 7, keys: "sssssssdd" }, { pct: 17.7, tick: 9, keys: "sa" }],                                    expectedLand: 144,  expectedTroops: 799   },
      { attacks: [{ pct: 21.6, tick: 8, keys: "wdd" }],                                                                               expectedLand: 264,  expectedTroops: 1466  },
      { attacks: [{ pct: 12.7, tick: 6, keys: "ssss" }, { pct: 32.2, tick: 8, keys: "wwwwwww" }],                                    expectedLand: 684,  expectedTroops: 2300  },
      { attacks: [{ pct: 24.7, tick: 5, keys: "ss" }, { pct: 32.2, tick: 7, keys: "ww" }, { pct: 36.8, tick: 8, keys: "w" }, { pct: 42.1, tick: 9, keys: "w" }],   expectedLand: 1984, expectedTroops: 2830  },
      { attacks: [{ pct: 38.3, tick: 6, keys: "aaa" }, { pct: 35.9, tick: 8, keys: "aa" }, { pct: 35.9, tick: 9 }],                  expectedLand: 3444, expectedTroops: 4776  },
    ]
  },
};

function getSavedMaxCycle(key, total) {
  return Math.min(parseInt(localStorage.getItem(`fx_trainer_maxCycle_${key}`) ?? "1"), total);
}

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  active: false,
  waitingForNewGame: false,
  waitingForCycleStart: false,
  openingKey: null,
  maxCycle: 1,
  currentCycle: 1,
  lastTick: -1,
  paused: false,
  fullOpening: false,
  mode: 'opening', // 'opening' | 'timer'
  timerMs: 97000,  // threshold for timer mode
  cycleCount: 0,
  _timerArmed: false, // true once timer has been seen below threshold in this game session
  cycleClicks: [],
  _pendingResultIdx: null,
  _lastTickTime: 0,
};

function resetCycleClicks() { state.cycleClicks = []; }

// ─── Click analysis ───────────────────────────────────────────────────────────

function analyzeClicks(clicks, expectedTicks) {
  const remaining = [...clicks];
  const matched = [];

  for (const expected of expectedTicks) {
    if (remaining.length === 0) {
      matched.push({ expected, actual: null });
      continue;
    }
    let bestIdx = 0;
    let bestDiff = Math.abs(remaining[0] - expected);
    for (let i = 1; i < remaining.length; i++) {
      const diff = Math.abs(remaining[i] - expected);
      if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
    }
    matched.push({ expected, actual: remaining[bestIdx] });
    remaining.splice(bestIdx, 1);
  }

  return { matched, extraClicks: remaining };
}

function buildClickFeedback(clicks, expectedTicks) {
  const lines = [];

  if (clicks.length === 0) {
    lines.push(`No attacks detected — should click at tick${expectedTicks.length > 1 ? "s" : ""} <b>${expectedTicks.join(", ")}</b>`);
    return lines;
  }

  const { matched, extraClicks } = analyzeClicks(clicks, expectedTicks);

  for (const { expected, actual } of matched) {
    if (actual === null) {
      lines.push(`Missed attack — should click at tick <b>${expected}</b>`);
    } else if (actual === expected) {
      lines.push(`Tick <b>${actual}</b> ✓ correct timing`);
    } else if (actual > expected) {
      const diff = actual - expected;
      lines.push(`Clicked tick <b>${actual}</b> — should be tick <b>${expected}</b> (${diff} tick${diff > 1 ? "s" : ""} too early)`);
    } else {
      const diff = expected - actual;
      lines.push(`Clicked tick <b>${actual}</b> — should be tick <b>${expected}</b> (${diff} tick${diff > 1 ? "s" : ""} too late)`);
    }
  }

  for (const extra of extraClicks) {
    lines.push(`Extra click at tick <b>${extra}</b> — not needed this cycle`);
  }

  return lines;
}

// ─── In-game overlay ──────────────────────────────────────────────────────────

const SEP = `<hr style="margin:4px 0;border:none;border-top:1px solid rgba(255,255,255,0.25)">`;

const overlay = document.createElement("div");
overlay.id = "trainerOverlay";
Object.assign(overlay.style, {
  position: "fixed", top: "10px", right: "10px",
  background: "rgba(0,0,0,0.82)", color: "white",
  padding: "10px 14px", border: "2px solid white", borderRadius: "8px",
  fontFamily: "'Trebuchet MS', Arial, sans-serif", fontSize: "13px",
  lineHeight: "1.6", minWidth: "185px", zIndex: "20", display: "none",
  pointerEvents: "none",
});
document.body.appendChild(overlay);

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const NUMS = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨"];

function renderOverlay(tick) {
  if (!state.active) { overlay.style.display = "none"; return; }
  overlay.style.display = "block";

  if (state.mode === 'timer') {
    const elapsed = getGameTimeMs();
    const remaining = Math.max(0, state.timerMs - elapsed);
    overlay.innerHTML =
      `<b>${formatMs(state.timerMs)} Timer</b>${SEP}` +
      `Time: <b>${formatMs(elapsed)}</b><br>` +
      `Remaining: <b>${formatMs(remaining)}</b>`;
    return;
  }

  const opening = openings[state.openingKey];

  if (state.waitingForCycleStart) {
    overlay.innerHTML = `<b>${opening.name}</b>${SEP}Waiting for cycle start (tick 9)…`;
    return;
  }
  if (state.currentCycle > state.maxCycle) {
    overlay.style.display = "none"; return;
  }

  const cycle = opening.cycles[state.currentCycle - 1];
  const attackLines = cycle.attacks
    .map((a, i) => `${NUMS[i] ?? `${i+1}.`} <b>${a.pct}%</b> → tick <b>${a.tick}</b>`)
    .join("<br>");

  overlay.innerHTML =
    `<b>${opening.name}</b> <span style="opacity:.6">C${state.currentCycle}/${state.maxCycle}</span>${SEP}` +
    attackLines + SEP +
    `Tick: <b>${tick >= 0 ? tick : "—"}</b><br>` +
    `Target: <b>${cycle.expectedLand}L ${cycle.expectedTroops}T</b>`;
}

// ─── Cycle briefing ───────────────────────────────────────────────────────────

const briefingEl = WindowManager.create({
  name: "trainerBriefing",
  classes: "flex-column text-align-center",
  closable: false,
});

function showBriefing(cycleIdx, onReady) {
  const opening = openings[state.openingKey];
  const cycle = opening.cycles[cycleIdx];

  briefingEl.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = `Cycle ${cycleIdx + 1} of ${state.maxCycle}`;
  briefingEl.appendChild(title);

  const attacksDiv = document.createElement("div");
  attacksDiv.style.cssText = "text-align:left;margin:8px 0";

  cycle.attacks.forEach((a, i) => {
    const p = document.createElement("p");
    p.style.margin = "4px 0";
    if (a.keys) {
      p.innerHTML = `${NUMS[i] ?? `${i+1}.`} Press <b>${a.keys}</b> → <b>${a.pct}%</b> · attack tick <b>${a.tick}</b>`;
    } else {
      p.innerHTML = `${NUMS[i] ?? `${i+1}.`} Set <b>${a.pct}%</b> · attack tick <b>${a.tick}</b>`;
    }
    attacksDiv.appendChild(p);
  });

  const targetP = document.createElement("p");
  targetP.style.cssText = "opacity:.7;font-size:.9em;margin-top:8px";
  targetP.innerHTML = `Target: <b>${cycle.expectedLand}L ${cycle.expectedTroops}T</b>`;

  const readyBtn = document.createElement("button");
  readyBtn.textContent = "Ready";
  readyBtn.addEventListener("click", () => {
    WindowManager.closeWindow("trainerBriefing");
    state.paused = false;
    __fx.resumeGame();
    onReady?.();
  });

  briefingEl.append(attacksDiv, targetP, readyBtn);

  state.paused = true;
  __fx.pauseGame();
  WindowManager.openWindow("trainerBriefing");
}

// ─── Multiplayer stats ───────────────────────────────────────────────────────

let _mpGameActive = false;
let _mpGameMode = null;
let _mpCrownTicks = 0;
let _mpTotalTicks = 0;
let _mpGameStartTime = 0;

function getMpMode() {
  const type = getVar("gGameType");
  if (getVar("gIsTeamGame")) {
    const now = new Date();
    return now.getMinutes() % 10 === 0 && now.getSeconds() < 5 ? "contest" : "side";
  }
  if (type === 7 || type === 10) return "br";
  if (type === 9)                return "zombie";
  return "1v1";
}

function mpStorageKey(mode) {
  return `fx_stats_mp_${mode}`;
}

function loadMpStats(mode) {
  return JSON.parse(localStorage.getItem(mpStorageKey(mode)) ?? "null") ?? { played: 0, won: 0, crownWins: 0, currentStreak: 0, bestStreak: 0, totalCrownTicks: 0, totalTicks: 0, totalLand: 0, landSamples: 0 };
}

function saveMpStats(mode, stats) {
  localStorage.setItem(mpStorageKey(mode), JSON.stringify(stats));
}

function isLocalPlayerCrown() {
  const pid        = getVar("playerId");
  const territories = getVar("playerTerritories");
  if (!territories) return false;
  const myLand = territories[pid] ?? 0;
  return myLand > 0 && myLand === Math.max(...Object.values(territories));
}

function finalizeMpGame(didWin) {
  if (!_mpGameActive) return;
  _mpGameActive = false;
  const elapsed = Date.now() - _mpGameStartTime;
  addTotalTime(elapsed);
  const stats = loadMpStats(_mpGameMode);
  stats.played++;
  stats.totalCrownTicks += _mpCrownTicks;
  stats.totalTicks      += _mpTotalTicks;
  if (elapsed >= 60000) {
    const pid = getVar("playerId");
    const territories = getVar("playerTerritories");
    const land = territories?.[pid] ?? 0;
    if (land > 0) { stats.totalLand += land; stats.landSamples++; }
  }
  if (didWin) {
    stats.won++;
    if (isLocalPlayerCrown()) stats.crownWins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
  } else {
    stats.currentStreak = 0;
  }
  saveMpStats(_mpGameMode, stats);
  _mpCrownTicks = 0;
  _mpTotalTicks = 0;
}

let _mpLossTimer = null;

export function onLocalPlayerWon() {
  if (!_mpGameActive) return;
  clearTimeout(_mpLossTimer);
  finalizeMpGame(true);
}

export function onOtherPlayerWon() {
  if (!_mpGameActive) return;
  // Start a loss timer — if local player's win event doesn't arrive within 500ms, record as loss
  clearTimeout(_mpLossTimer);
  _mpLossTimer = setTimeout(() => finalizeMpGame(false), 500);
}

// Called directly for team games and 1v1 where the win/loss is determined in the game end branch
export function onGameResult(didWin) {
  if (!_mpGameActive) return;
  clearTimeout(_mpLossTimer);
  finalizeMpGame(didWin);
}

window.addEventListener("beforeunload", () => finalizeMpGame(false));

// ─── Timer stats ─────────────────────────────────────────────────────────────

function timerStorageKey() {
  if (state.timerMs === 97000) return "fx_stats_137";
  if (state.timerMs === 72000) return "fx_stats_112";
  if (state.timerMs === 50000) return "fx_stats_050";
  return "fx_stats_033";
}

function timerEffScore(land, troops) {
  if (state.timerMs === 97000) return land + troops / 6;
  if (state.timerMs === 72000) return land + troops / 5;
  if (state.timerMs === 50000) return land + troops / 4;
  return land;
}

function saveTimerResult(land, troops) {
  const key = timerStorageKey();
  const data = JSON.parse(localStorage.getItem(key) ?? "[]");
  data.push({ land, troops });
  localStorage.setItem(key, JSON.stringify(data));
  addTotalTime(state.timerMs);
}

function loadTimerStats(storageKey) {
  const data = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
  if (data.length === 0) return null;
  const eff = d => d.land > 0 ? d.troops / d.land : Infinity;
  const best  = data.reduce((b, d) => d.land > b.land ? d : b, data[0]);
  const worst = data.reduce((b, d) => d.land < b.land ? d : b, data[0]);
  const bestEff  = data.reduce((b, d) => eff(d) < eff(b) ? d : b, data[0]);
  const worstEff = data.reduce((b, d) => eff(d) > eff(b) ? d : b, data[0]);
  const avgLand   = Math.round(data.reduce((s, d) => s + d.land,   0) / data.length);
  const avgTroops = Math.round(data.reduce((s, d) => s + d.troops, 0) / data.length);
  const avgEff = avgLand > 0 ? avgTroops / avgLand : 0;
  return { best, worst, bestEff, worstEff, avgLand, avgTroops, avgEff, runs: data.length };
}

// ─── Stats window ─────────────────────────────────────────────────────────────

const statsEl = WindowManager.create({ name: "trainerStats", classes: "flex-column text-align-center" });
statsEl.style.backgroundColor = "rgba(0,0,0,0.95)";

function renderStatsTab(mainTab, subTab = "137", mpMode = "contest") {
  statsEl.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "Stats";
  statsEl.appendChild(title);

  const timeP = document.createElement("p");
  timeP.style.cssText = "margin:0 0 8px;opacity:.6;font-size:.85em";
  timeP.textContent = `Total time played: ${formatDuration(getTotalTime())}`;
  statsEl.appendChild(timeP);

  // Main tabs: Singleplayer | Multiplayer
  const mainRow = document.createElement("div");
  mainRow.style.cssText = "display:flex;gap:8px;justify-content:center;margin-bottom:12px";
  [["sp", "Singleplayer"], ["mp", "Multiplayer"]].forEach(([k, lbl]) => {
    const btn = document.createElement("button");
    btn.textContent = lbl;
    btn.style.opacity = k === mainTab ? "1" : "0.4";
    btn.addEventListener("click", () => renderStatsTab(k));
    mainRow.appendChild(btn);
  });
  statsEl.appendChild(mainRow);

  if (mainTab === "sp") {
    // Sub-tabs: 1:37 | 0:50
    const subRow = document.createElement("div");
    subRow.style.cssText = "display:flex;gap:8px;justify-content:center;margin-bottom:12px";
    [["137", "1:37"], ["112", "1:12"], ["050", "0:50"], ["033", "0:33"], ["op", "Openings"]].forEach(([k, lbl]) => {
      const btn = document.createElement("button");
      btn.textContent = lbl;
      btn.style.opacity = k === subTab ? "1" : "0.4";
      btn.addEventListener("click", () => renderStatsTab("sp", k));
      subRow.appendChild(btn);
    });
    statsEl.appendChild(subRow);

    if (subTab === "op") {
      const table = document.createElement("table");
      table.style.cssText = "width:100%;border-collapse:collapse;text-align:left";
      let hasData = false;
      Object.entries(openings).forEach(([key, o]) => {
        const data = loadOpeningAccuracy(key);
        if (!data.cycles.length) return;
        const total = data.cycles.reduce((s, c) => ({ attempts: s.attempts + c.attempts, passed: s.passed + c.passed }), { attempts: 0, passed: 0 });
        if (total.attempts === 0) return;
        hasData = true;
        // find worst cycle by pass rate
        let worstIdx = -1, worstRate = Infinity;
        data.cycles.forEach((c, i) => {
          if (c.attempts === 0) return;
          const rate = c.passed / c.attempts;
          if (rate < worstRate) { worstRate = rate; worstIdx = i; }
        });
        const worstStr = worstIdx >= 0 ? ` · Worst: Cycle ${worstIdx + 1} (${(worstRate * 100).toFixed(0)}%)` : "";
        const overallPct = ((total.passed / total.attempts) * 100).toFixed(1);
        const tr = document.createElement("tr");
        tr.innerHTML = `<td style="opacity:.6;padding:6px 12px 6px 0">${o.name}</td><td><b>${overallPct}%</b><span style="opacity:.6;font-size:.85em">${worstStr}</span></td>`;
        table.appendChild(tr);
      });
      if (!hasData) {
        const empty = document.createElement("p");
        empty.style.opacity = "0.5";
        empty.textContent = "No runs recorded yet.";
        statsEl.appendChild(empty);
      } else {
        statsEl.appendChild(table);
        const clearBtn = document.createElement("button");
        clearBtn.textContent = "Clear";
        clearBtn.style.cssText = "margin-top:10px;opacity:.5;font-size:.85em";
        clearBtn.addEventListener("click", () => {
          Object.keys(openings).forEach(k => localStorage.removeItem(`fx_stats_op_${k}`));
          renderStatsTab("sp", "op");
        });
        statsEl.appendChild(clearBtn);
      }
    } else {
      const storageKey = `fx_stats_${subTab}`;
      const stats = loadTimerStats(storageKey);
      if (!stats) {
        const empty = document.createElement("p");
        empty.style.opacity = "0.5";
        empty.textContent = "No runs recorded yet.";
        statsEl.appendChild(empty);
      } else {
        const table = document.createElement("table");
        table.style.cssText = "width:100%;border-collapse:collapse;text-align:left";
        const fe = d => (d.land > 0 ? d.troops / d.land : 0).toFixed(1);
        [
          ["Best",    `${stats.best.land}L ${stats.best.troops}T`],
          ["Worst",   `${stats.worst.land}L ${stats.worst.troops}T`],
          ["Average", `${stats.avgLand}L ${stats.avgTroops}T`],
          ["Efficiency (avg)", `${stats.avgEff.toFixed(1)} T/px`],
          ["Best efficiency",  `${fe(stats.bestEff)} T/px (${stats.bestEff.land}L)`],
          ["Worst efficiency", `${fe(stats.worstEff)} T/px (${stats.worstEff.land}L)`],
          ["Runs",    `${stats.runs}`],
        ].forEach(([label, val]) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td style="opacity:.6;padding:6px 12px 6px 0">${label}</td><td><b>${val}</b></td>`;
          table.appendChild(tr);
        });
        statsEl.appendChild(table);

        // Graph
        const allData = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
        if (allData.length > 1) {
          let graphN = Math.min(10, allData.length);
          const graphWrap = document.createElement("div");
          graphWrap.style.cssText = "margin-top:12px";

          const toggleRow = document.createElement("div");
          toggleRow.style.cssText = "display:flex;gap:6px;justify-content:center;margin-bottom:6px";

          const canvas = document.createElement("canvas");
          canvas.width = 320; canvas.height = 120;
          canvas.style.cssText = "width:100%;display:block";

          function drawGraph(n) {
            graphN = n;
            const slice = allData.slice(-n);
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const W = canvas.width, H = canvas.height;
            const pad = { top: 10, bottom: 20, left: 10, right: 10 };
            const iW = W - pad.left - pad.right;
            const iH = H - pad.top - pad.bottom;
            const lands = slice.map(d => d.land);
            const minL = Math.min(...lands), maxL = Math.max(...lands);
            const range = maxL - minL || 1;
            const x = i => pad.left + (slice.length === 1 ? iW / 2 : (i / (slice.length - 1)) * iW);
            const y = v => pad.top + iH - ((v - minL) / range) * iH;

            // avg line
            const avg = lands.reduce((s, v) => s + v, 0) / lands.length;
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(pad.left, y(avg));
            ctx.lineTo(W - pad.right, y(avg));
            ctx.stroke();
            ctx.setLineDash([]);

            // line
            ctx.strokeStyle = "#4af";
            ctx.lineWidth = 2;
            ctx.beginPath();
            slice.forEach((d, i) => i === 0 ? ctx.moveTo(x(i), y(d.land)) : ctx.lineTo(x(i), y(d.land)));
            ctx.stroke();

            // dots
            slice.forEach((d, i) => {
              ctx.fillStyle = "#4af";
              ctx.beginPath();
              ctx.arc(x(i), y(d.land), 3, 0, Math.PI * 2);
              ctx.fill();
            });

            // x labels: first and last run numbers
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(`#${allData.length - slice.length + 1}`, pad.left, H - 4);
            ctx.textAlign = "right";
            ctx.fillText(`#${allData.length}`, W - pad.right, H - 4);

            // y labels
            ctx.textAlign = "right";
            ctx.fillText(maxL.toLocaleString(), pad.left + 8, pad.top + 8);
            ctx.fillText(minL.toLocaleString(), pad.left + 8, H - pad.bottom - 4);

            // update toggle button styles
            [10, 50, 0].forEach((v, idx) => {
              const btn = toggleRow.children[idx];
              if (btn) btn.style.opacity = graphN === (v || allData.length) ? "1" : "0.4";
            });
          }

          [[10, "Last 10"], [50, "Last 50"], [0, "All"]].forEach(([n, lbl]) => {
            const btn = document.createElement("button");
            btn.textContent = lbl;
            btn.style.cssText = "font-size:.8em;padding:2px 8px";
            btn.addEventListener("click", () => drawGraph(n || allData.length));
            toggleRow.appendChild(btn);
          });

          graphWrap.appendChild(toggleRow);
          graphWrap.appendChild(canvas);
          statsEl.appendChild(graphWrap);
          drawGraph(Math.min(10, allData.length));
        }

        const clearBtn = document.createElement("button");
        clearBtn.textContent = "Clear";
        clearBtn.style.cssText = "margin-top:10px;opacity:.5;font-size:.85em";
        clearBtn.addEventListener("click", () => { localStorage.removeItem(storageKey); renderStatsTab("sp", subTab); });
        statsEl.appendChild(clearBtn);
      }
    }
  } else {
    // Mode sub-tabs
    const modeRow = document.createElement("div");
    modeRow.style.cssText = "display:flex;gap:8px;justify-content:center;margin-bottom:12px";
    [["contest", "Contest"], ["side", "Side"], ["1v1", "1v1"], ["br", "Battle Royale"], ["zombie", "Zombies"]].forEach(([k, lbl]) => {
      const btn = document.createElement("button");
      btn.textContent = lbl;
      btn.style.opacity = k === mpMode ? "1" : "0.4";
      btn.addEventListener("click", () => renderStatsTab("mp", subTab, k));
      modeRow.appendChild(btn);
    });
    statsEl.appendChild(modeRow);

    const stats = loadMpStats(mpMode);
    const pct = (n, d) => d > 0 ? ((n / d) * 100).toFixed(1) + "%" : "—";
    const crownTimePct = stats.totalTicks > 0 ? ((stats.totalCrownTicks / stats.totalTicks) * 100).toFixed(1) + "%" : "—";
    const table = document.createElement("table");
    table.style.cssText = "width:100%;border-collapse:collapse;text-align:left";
    [
      ["Games Played",  `${stats.played}`],
      ["Games Won",     `${stats.won} (${pct(stats.won, stats.played)})`],
      ["Crown Wins",    `${stats.crownWins} (${pct(stats.crownWins, stats.played)})`],
      ["Crown Time",    crownTimePct],
      ["Win Streak",    `${stats.currentStreak} current · ${stats.bestStreak} best`],
      ["Avg Land (1m+)", stats.landSamples > 0 ? `${Math.round(stats.totalLand / stats.landSamples)}` : "—"],
    ].forEach(([label, val]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style="opacity:.6;padding:6px 12px 6px 0">${label}</td><td><b>${val}</b></td>`;
      table.appendChild(tr);
    });
    statsEl.appendChild(table);
    if (stats.played > 0) {
      const clearBtn = document.createElement("button");
      clearBtn.textContent = "Clear";
      clearBtn.style.cssText = "margin-top:10px;opacity:.5;font-size:.85em";
      clearBtn.addEventListener("click", () => { localStorage.removeItem(mpStorageKey(mpMode)); renderStatsTab("mp", subTab, mpMode); });
      statsEl.appendChild(clearBtn);
    }
  }

  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display:flex;gap:8px;justify-content:center;margin-top:10px";

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export";
  exportBtn.style.opacity = "0.6";
  exportBtn.addEventListener("click", () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("fx_stats_") || k === "fx_winCount");
    const data = {};
    keys.forEach(k => { data[k] = localStorage.getItem(k); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "fxclient_stats.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  const importBtn = document.createElement("button");
  importBtn.textContent = "Import";
  importBtn.style.opacity = "0.6";
  importBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
          renderStatsTab(mainTab, subTab, mpMode);
        } catch { alert("Invalid stats file."); }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => WindowManager.closeWindow("trainerStats"));

  btnRow.appendChild(exportBtn);
  btnRow.appendChild(importBtn);
  btnRow.appendChild(closeBtn);
  statsEl.appendChild(btnRow);
}

export function showStats() {
  renderStatsTab("sp");
  WindowManager.openWindow("trainerStats");
}

// ─── Timer result ─────────────────────────────────────────────────────────────

function showTimerResult(land, troops) {
  // Check for PB before saving so we can compare against previous best
  const allPrevRuns = JSON.parse(localStorage.getItem(timerStorageKey()) ?? "[]");
  const score = timerEffScore(land, troops);
  const prevBestScore = allPrevRuns.length > 0
    ? Math.max(...allPrevRuns.map(d => timerEffScore(d.land, d.troops)))
    : -Infinity;
  const newPB = allPrevRuns.length > 0 && score > prevBestScore;

  saveTimerResult(land, troops);

  resultEl.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = formatMs(state.timerMs);
  resultEl.appendChild(title);

  const statsP = document.createElement("p");
  statsP.innerHTML = `Land: <b>${land}</b><br>Troops: <b>${troops}</b>`;
  resultEl.appendChild(statsP);

  // Milestone
  if (newPB) {
    const milestoneP = document.createElement("p");
    milestoneP.style.cssText = "color:#ffd700;font-weight:bold;margin-top:6px";
    milestoneP.textContent = `★ New PB: ${Math.round(score).toLocaleString()}`;
    resultEl.appendChild(milestoneP);
  }

  // Show session best inline
  const allStats = loadTimerStats(timerStorageKey());
  if (allStats && allStats.runs > 1) {
    const allRuns = JSON.parse(localStorage.getItem(timerStorageKey()) ?? "[]");
    const bestRun = allRuns.reduce((b, d) => timerEffScore(d.land, d.troops) > timerEffScore(b.land, b.troops) ? d : b, allRuns[0]);
    const pb = document.createElement("p");
    pb.style.cssText = "font-size:.9em;opacity:.7;margin-top:4px";
    pb.innerHTML = `Best: <b>${bestRun.land}L ${bestRun.troops}T</b> · Avg: <b>${allStats.avgLand}L</b> · Runs: <b>${allStats.runs}</b>`;
    resultEl.appendChild(pb);
  }

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "Restart game";
  restartBtn.addEventListener("click", () => {
    state.paused = false;
    __fx.resumeGame();
    WindowManager.closeWindow("trainerResult");
    __fx.restartGame?.();
  });

  const stopBtn = document.createElement("button");
  stopBtn.textContent = "Close";
  stopBtn.addEventListener("click", () => {
    state.active = false;
    delete window.__fx_aCY;
    __fx.resumeGame();
    overlay.style.display = "none";
    WindowManager.closeWindow("trainerResult");
  });

  resultEl.append(restartBtn, stopBtn);

  state.paused = true;
  __fx.pauseGame();
  WindowManager.openWindow("trainerResult");

  const watchForExit = () => {
    if (!state.paused) return;
    if (!getVar("gIsSingleplayer") || getVar("gameState") === 0) {
      state.paused = false;
      __fx.resumeGame();
      WindowManager.closeWindow("trainerResult");
      return;
    }
    setTimeout(watchForExit, 100);
  };
  setTimeout(watchForExit, 100);
}

// ─── Result modal ─────────────────────────────────────────────────────────────

const resultEl = WindowManager.create({
  name: "trainerResult",
  classes: "flex-column text-align-center",
  closable: false,
});

const TOTAL_TIME_KEY = "fx_stats_total_time";

function addTotalTime(ms) {
  const current = parseInt(localStorage.getItem(TOTAL_TIME_KEY) ?? "0", 10);
  localStorage.setItem(TOTAL_TIME_KEY, String(current + ms));
}

function getTotalTime() {
  return parseInt(localStorage.getItem(TOTAL_TIME_KEY) ?? "0", 10);
}

function formatDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function recordOpeningAccuracy(openingKey, cycleIdx, numCycles, success) {
  const key  = `fx_stats_op_${openingKey}`;
  const data = JSON.parse(localStorage.getItem(key) ?? "null") ?? { cycles: [] };
  while (data.cycles.length < numCycles) data.cycles.push({ attempts: 0, passed: 0 });
  data.cycles[cycleIdx].attempts++;
  if (success) data.cycles[cycleIdx].passed++;
  localStorage.setItem(key, JSON.stringify(data));
}

function loadOpeningAccuracy(openingKey) {
  return JSON.parse(localStorage.getItem(`fx_stats_op_${openingKey}`) ?? "null") ?? { cycles: [] };
}

function showResult(cycleIdx, snapshot) {
  const land   = snapshot.land;
  const troops = snapshot.troops;

  const opening = openings[state.openingKey];
  const cycle = opening.cycles[cycleIdx];
  const attackTicks = cycle.attacks.map(a => a.tick);
  const landOk   = land   === cycle.expectedLand;
  const troopsOk = troops === cycle.expectedTroops;
  const success  = landOk && troopsOk;
  recordOpeningAccuracy(state.openingKey, cycleIdx, opening.cycles.length, success);
  const isLastCycle = cycleIdx === state.maxCycle - 1;

  const clicksThisCycle = [...state.cycleClicks];

  if (cycleIdx + 1 < opening.cycles.length) {
    state.maxCycle = Math.max(state.maxCycle, cycleIdx + 2);
    if (success) {
      const newMax = Math.max(getSavedMaxCycle(state.openingKey, opening.cycles.length), cycleIdx + 2);
      localStorage.setItem(`fx_trainer_maxCycle_${state.openingKey}`, String(newMax));
    }
  }

  // In full opening mode, skip the popup for all but the last cycle.
  // Must reset state.paused — it was set true in the tick handler before the poll ran.
  if (state.fullOpening && !isLastCycle) {
    state.paused = false;
    resetCycleClicks();
    return;
  }

  resultEl.innerHTML = "";

  const title = document.createElement("h3");

  if (state.fullOpening) {
    title.style.color = success ? "#32cd32" : "#dc143c";
    title.textContent = success ? "Opening complete! Well done." : "Opening complete.";
    const statsP = document.createElement("p");
    statsP.innerHTML = `Final: <b>${land}L ${troops}T</b><br>Target: ${cycle.expectedLand}L ${cycle.expectedTroops}T`;
    resultEl.append(title, statsP);
  } else {
    title.style.color = success ? "#32cd32" : "#dc143c";
    title.textContent = success
      ? (isLastCycle ? "Opening complete! Well done." : `Cycle ${cycleIdx + 1} complete!`)
      : `Cycle ${cycleIdx + 1} failed`;
    const statsP = document.createElement("p");
    statsP.innerHTML = `Got: ${land}L ${troops}T<br>Target: ${cycle.expectedLand}L ${cycle.expectedTroops}T`;
    resultEl.append(title, statsP);
  }

  if (state.fullOpening) {
    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Restart game";
    restartBtn.addEventListener("click", () => {
      state.paused = false;
      __fx.resumeGame();
      WindowManager.closeWindow("trainerResult");
      __fx.restartGame?.();
    });
    const stopBtn = document.createElement("button");
    stopBtn.textContent = "Close";
    stopBtn.addEventListener("click", () => {
      state.active = false;
      delete window.__fx_aCY;
      __fx.resumeGame();
      overlay.style.display = "none";
      WindowManager.closeWindow("trainerResult");
    });

    const microLabel = document.createElement("p");
    microLabel.style.cssText = "margin:10px 0 4px;opacity:.8;font-size:.9em";
    microLabel.textContent = "Practice Micro:";
    const microRow = document.createElement("div");
    [["0.25", "0.25x"], ["0.5", "0.5x"], ["0.75", "0.75x"]].forEach(([speed, lbl]) => {
      const btn = document.createElement("button");
      btn.textContent = lbl;
      btn.addEventListener("click", () => {
        window.__fx_aCY = Math.round(56 / parseFloat(speed));
        state.active = false;
        state.paused = false;
        __fx.resumeGame();
        WindowManager.closeWindow("trainerResult");
      });
      microRow.appendChild(btn);
    });

    resultEl.append(restartBtn, stopBtn, microLabel, microRow);
  } else if (!success) {
    // Deltas
    const landDiff   = land   - cycle.expectedLand;
    const troopsDiff = troops - cycle.expectedTroops;
    const sign = n => n > 0 ? `+${n}` : `${n}`;
    const deltaP = document.createElement("p");
    deltaP.style.cssText = "font-size:.9em;margin-top:2px";
    const landCol   = landDiff   === 0 ? "inherit" : landDiff   > 0 ? "#f4a460" : "#f4a460";
    const troopsCol = troopsDiff === 0 ? "inherit" : "#f4a460";
    const landPart   = landDiff   !== 0 ? `<span style="color:${landCol}">${sign(landDiff)} land</span>` : `<span style="opacity:.5">land ✓</span>`;
    const troopsPart = troopsDiff !== 0 ? `<span style="color:${troopsCol}">${sign(troopsDiff)} troops</span>` : `<span style="opacity:.5">troops ✓</span>`;
    deltaP.innerHTML = `${landPart} &nbsp; ${troopsPart}`;
    resultEl.appendChild(deltaP);

    // Diagnosis
    const { matched, extraClicks } = analyzeClicks(clicksThisCycle, attackTicks);
    const missedOrWrong = matched.filter(m => m.actual === null || m.actual !== m.expected).length;
    const diagP = document.createElement("p");
    diagP.style.cssText = "font-size:.9em;margin-top:4px;font-style:italic;opacity:.85";
    let diag = "";
    if (clicksThisCycle.length === 0) {
      diag = "No attacks detected — did you forget to click?";
    } else if (missedOrWrong > 0 && landDiff > 0 && troopsDiff < 0) {
      diag = "Late attack — more time passed, so more troops were spent taking extra land.";
    } else if (missedOrWrong > 0 && landDiff < 0 && troopsDiff > 0) {
      diag = "Early attack — fewer troops were ready, so less land was taken and more were retained.";
    } else if (missedOrWrong > 0) {
      diag = "Timing was off — fix the click timing to hit the target.";
    } else if (extraClicks.length > 0 && landOk) {
      diag = `Extra clicks detected — timing was correct but double-clicking can waste troops.`;
    } else if (extraClicks.length > 0) {
      diag = `Extra clicks affected the result — only click at the expected ticks.`;
    } else if (landOk && !troopsOk) {
      diag = troopsDiff < 0
        ? "Correct land but troops too low — attack % was slightly too high."
        : "Correct land but troops too high — attack % was slightly too low.";
    } else if (!landOk && troopsOk) {
      diag = landDiff > 0
        ? "Correct troops but too much land — attack % too low (not enough troops pushed out)."
        : "Correct troops but too little land — attack % too high (overspent troops on fewer tiles).";
    } else if (landDiff > 0 && troopsDiff < 0) {
      diag = "Attack % too high — sent too many troops, capturing extra land.";
    } else if (landDiff < 0 && troopsDiff > 0) {
      diag = "Attack % too low — sent too few troops, capturing less land.";
    } else {
      diag = "Both land and troops off — check timing and attack %.";
    }
    diagP.textContent = diag;
    resultEl.appendChild(diagP);

    // Timing breakdown
    const clickLines = buildClickFeedback(clicksThisCycle, attackTicks);
    const timingSection = document.createElement("div");
    timingSection.style.cssText = "text-align:left;font-size:.9em;border-top:1px solid rgba(255,255,255,0.25);padding-top:8px;margin-top:6px";

    const timingTitle = document.createElement("b");
    timingTitle.textContent = "Attack timing:";
    timingSection.appendChild(timingTitle);

    const timingList = document.createElement("ul");
    timingList.style.cssText = "margin:4px 0 0 0;padding-left:18px";
    clickLines.forEach(line => {
      const li = document.createElement("li");
      li.innerHTML = line;
      timingList.appendChild(li);
    });
    timingSection.appendChild(timingList);

    // Expected %s
    const attackHints = cycle.attacks.map((a, i) => `${NUMS[i] ?? `${i+1}.`} <b>${a.pct}%</b> tick <b>${a.tick}</b>`).join("  ");
    const pctHint = document.createElement("p");
    pctHint.style.cssText = "font-size:.85em;margin-top:6px;opacity:.7";
    pctHint.innerHTML = `Expected: ${attackHints}`;
    timingSection.appendChild(pctHint);

    resultEl.appendChild(timingSection);

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Restart game";
    restartBtn.addEventListener("click", () => {
      state.paused = false;
      __fx.resumeGame();
      WindowManager.closeWindow("trainerResult");
      __fx.restartGame?.();
    });

    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue anyway";
    continueBtn.addEventListener("click", () => {
      WindowManager.closeWindow("trainerResult");
      if (!isLastCycle) {
        showBriefing(cycleIdx + 1);
      } else {
        state.paused = false;
        __fx.resumeGame();
      }
    });
    resultEl.append(restartBtn, continueBtn);
  } else {
    if (!isLastCycle) {
      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Continue to next cycle";
      nextBtn.addEventListener("click", () => {
        WindowManager.closeWindow("trainerResult");
        showBriefing(cycleIdx + 1);
      });
      resultEl.appendChild(nextBtn);
    }

    const stopBtn = document.createElement("button");
    stopBtn.textContent = isLastCycle ? "Close" : "Stop practicing";
    stopBtn.addEventListener("click", () => {
      state.active = false;
      __fx.resumeGame();
      overlay.style.display = "none";
      WindowManager.closeWindow("trainerResult");
    });
    resultEl.appendChild(stopBtn);
  }

  state.paused = true;
  __fx.pauseGame();
  WindowManager.openWindow("trainerResult");

  const watchForExit = () => {
    if (!state.paused) return;
    if (!getVar("gIsSingleplayer") || getVar("gameState") === 0) {
      state.paused = false;
      __fx.resumeGame();
      WindowManager.closeWindow("trainerResult");
      WindowManager.closeWindow("trainerBriefing");
      return;
    }
    setTimeout(watchForExit, 100);
  };
  setTimeout(watchForExit, 100);
}

// ─── Opening selector ─────────────────────────────────────────────────────────

const selectorEl = WindowManager.create({ name: "trainerSelector", classes: "flex-column" });

const selectorTitle = document.createElement("h1");
selectorTitle.textContent = "Practice Mode";
selectorEl.appendChild(selectorTitle);

// Type selector
const typeLabel = document.createElement("label");
typeLabel.textContent = "Type: ";
const typeSelect = document.createElement("select");
typeLabel.appendChild(typeSelect);
["Opening", "Timer"].forEach(t => {
  const opt = document.createElement("option");
  opt.value = t.toLowerCase(); opt.textContent = t;
  typeSelect.appendChild(opt);
});

// Opening selector
const modeLabel = document.createElement("label");
modeLabel.textContent = "Opening: ";
const modeSelect = document.createElement("select");
modeLabel.appendChild(modeSelect);
Object.entries(openings).forEach(([key, o]) => {
  const opt = document.createElement("option");
  opt.value = key; opt.textContent = o.name;
  modeSelect.appendChild(opt);
});

// Cycle mode selector
const cycleLabel = document.createElement("label");
cycleLabel.textContent = "Mode: ";
const cycleSelect = document.createElement("select");
cycleLabel.appendChild(cycleSelect);
["Learn Opening", "Full Opening"].forEach((t, i) => {
  const opt = document.createElement("option");
  opt.value = i === 0 ? "learn" : "full"; opt.textContent = t;
  cycleSelect.appendChild(opt);
});

// Timer selector
const timerLabel = document.createElement("label");
timerLabel.textContent = "Timer: ";
const timerSelect = document.createElement("select");
timerLabel.appendChild(timerSelect);
[["137", "1:37 Timer"], ["112", "1:12 Timer"], ["050", "0:50 Timer"], ["033", "0:33 Timer"]].forEach(([val, txt]) => {
  const opt = document.createElement("option");
  opt.value = val; opt.textContent = txt;
  timerSelect.appendChild(opt);
});

const openingSelect = modeSelect;

// Speed selector (Micro mode)
const speedLabel = document.createElement("label");
speedLabel.textContent = "Speed: ";
const speedSelect = document.createElement("select");
speedLabel.appendChild(speedSelect);
[["0.25", "0.25x"], ["0.5", "0.5x"], ["0.75", "0.75x"]].forEach(([val, txt]) => {
  const opt = document.createElement("option");
  opt.value = val; opt.textContent = txt;
  speedSelect.appendChild(opt);
});
speedSelect.value = "0.5";

function refreshSelector() {
  const isTimer = typeSelect.value === "timer";
  modeLabel.style.display  = isTimer ? "none" : "";
  cycleLabel.style.display = isTimer ? "none" : "";
  timerLabel.style.display = isTimer ? "" : "none";
  speedLabel.style.display = "none";
}
typeSelect.addEventListener("change", refreshSelector);

const noteP = document.createElement("p");
noteP.style.cssText = "opacity:.7;font-size:.9em;margin:8px 0";
noteP.textContent = "Arm the trainer, then start a singleplayer game.";

const armBtn = document.createElement("button");
armBtn.textContent = "Arm Trainer";
armBtn.addEventListener("click", () => {
  const type = typeSelect.value;
  if (type === "timer") {
    const key = timerSelect.value;
    Object.assign(state, {
      active: true, waitingForNewGame: false, waitingForCycleStart: false,
      openingKey: null, maxCycle: 0, currentCycle: 1, lastTick: -1,
      paused: false, fullOpening: false, mode: 'timer',
      timerMs: key === "137" ? 97000 : key === "112" ? 72000 : key === "050" ? 50000 : 33000,
      cycleCount: 0, _timerArmed: false,
    });
  } else {
    const key = modeSelect.value;
    const isFull = cycleSelect.value === "full";
    const total = openings[key].cycles.length;
    Object.assign(state, {
      active: true, waitingForNewGame: false, waitingForCycleStart: false,
      openingKey: key, maxCycle: total,
      currentCycle: 1, lastTick: -1, paused: false, fullOpening: isFull,
      mode: 'opening', cycleCount: 0,
    });
  }
  resetCycleClicks();
  renderOverlay(-1);
  __fx.selectMap?.(0, 1);
  WindowManager.closeWindow("trainerSelector");
});

selectorEl.append(
  typeLabel, document.createElement("br"),
  modeLabel, document.createElement("br"),
  cycleLabel, document.createElement("br"),
  timerLabel, document.createElement("br"),
  speedLabel, document.createElement("br"),
  noteP, armBtn
);
refreshSelector();

// ─── Game hooks ───────────────────────────────────────────────────────────────

export function _onGameTick(tick) {
  state._lastTickTime = Date.now();
  if (_mpGameActive) {
    _mpTotalTicks++;
    if (isLocalPlayerCrown()) _mpCrownTicks++;
  }
  if (!state.active) return;

  if (!getVar("gIsSingleplayer") || getVar("gameState") === 0) {
    state.paused = false;
    __fx.resumeGame();
    WindowManager.closeWindow("trainerResult");
    WindowManager.closeWindow("trainerBriefing");
    renderOverlay(tick); return;
  }

  if (state.paused || state.waitingForNewGame) return;

  if (state.mode === 'timer') {
    const t = getGameTimeMs();
    if (!state._timerArmed) {
      if (t < state.timerMs) state._timerArmed = true;
      else { renderOverlay(tick); return; }
    }
    renderOverlay(tick);
    if (t >= state.timerMs) {
      state.paused = true;
      const pid = getVar("playerId");
      let prevTroops = getVar("playerBalances")?.[pid] ?? 0;
      let prevLand   = getVar("playerTerritories")?.[pid] ?? 0;
      let stableCount = 0, polls = 0;
      const poll = () => {
        const troops = getVar("playerBalances")?.[pid] ?? 0;
        const land   = getVar("playerTerritories")?.[pid] ?? 0;
        if (troops === prevTroops && land === prevLand) stableCount++;
        else { prevTroops = troops; prevLand = land; stableCount = 0; }
        polls++;
        if (stableCount >= 6 || polls >= 40) showTimerResult(prevLand, prevTroops);
        else setTimeout(poll, 50);
      };
      setTimeout(poll, 50);
    }
    return;
  }

  if (state.waitingForCycleStart) {
    if (tick === 0) state.waitingForCycleStart = false;
    else { renderOverlay(tick); return; }
  }

  const isFirstTick = state.lastTick === -1;

  if (isFirstTick) {
    if (tick !== 0) {
      state.waitingForCycleStart = true;
      renderOverlay(tick); return;
    }
  } else if (tick === 9 && state._pendingResultIdx === null && state.currentCycle >= 1 && state.currentCycle <= state.maxCycle) {
    state._pendingResultIdx = state.currentCycle - 1;
    state.currentCycle++;
  } else if (state._pendingResultIdx !== null && tick === 0) {
    const cycleIdx = state._pendingResultIdx;
    state._pendingResultIdx = null;
    state.paused = true;
    const pid = getVar("playerId");
    let prevTroops = getVar("playerBalances")?.[pid] ?? 0;
    let prevLand   = getVar("playerTerritories")?.[pid] ?? 0;
    let stableCount = 0, polls = 0;
    const MAX_POLLS = 40;
    const poll = () => {
      const troops = getVar("playerBalances")?.[pid] ?? 0;
      const land   = getVar("playerTerritories")?.[pid] ?? 0;
      if (troops === prevTroops && land === prevLand) {
        stableCount++;
      } else {
        prevTroops = troops; prevLand = land; stableCount = 0;
      }
      polls++;
      if (stableCount >= 6 || polls >= MAX_POLLS) {
        showResult(cycleIdx, { land: prevLand, troops: prevTroops });
        resetCycleClicks();
      } else {
        setTimeout(poll, 50);
      }
    };
    setTimeout(poll, 50);
    state.lastTick = tick;
    return;
  }

  state.lastTick = tick;
  renderOverlay(tick);
}

export function onGameInit() {
  const isMultiplayer = !getVar("gIsSingleplayer");
  if (isMultiplayer) { _mpGameActive = true; _mpGameMode = getMpMode(); _mpCrownTicks = 0; _mpTotalTicks = 0; _mpGameStartTime = Date.now(); clearTimeout(_mpLossTimer); }
  if (!state.active) return;
  Object.assign(state, {
    waitingForNewGame: false, waitingForCycleStart: false,
    currentCycle: 1, lastTick: -1, paused: false, _pendingResultIdx: null,
    cycleCount: 0, _timerArmed: false,
  });
  resetCycleClicks();
  WindowManager.closeWindow("trainerResult");
  renderOverlay(-1);

  // Apply slow-motion tick interval for micro mode
  if (state.mode === 'micro') {
    window.__fx_aCY = Math.round(56 / state.microSpeed);
  } else {
    delete window.__fx_aCY;
  }

  // In Learn Opening mode, pause immediately and show cycle 1 briefing
  if (state.mode === 'opening' && !state.fullOpening) {
    showBriefing(0);
  }
}

export function showSelector() {
  refreshSelector();
  WindowManager.openWindow("trainerSelector");
}

export function onCustomScenarioOpen() {
  if (!state.active) return;
  if (window.aD?.data) {
    window.aD.data.mapType = 0;
    window.aD.data.mapProceduralIndex = 1;
  }
  window.__fx_aTO?.();
}

export function onAttackSent() {
  if (!state.active || state.paused || state.waitingForNewGame || state.waitingForCycleStart) return;
  if (!getVar("gIsSingleplayer") || getVar("gameState") === 0) return;
  if (state.currentCycle < 1 || state.currentCycle > state.maxCycle) return;
  if (state.lastTick < 0) return;
  state.cycleClicks.push(state.lastTick);
}

export default { showSelector, showStats, _onGameTick, onGameInit, onCustomScenarioOpen, onAttackSent, onLocalPlayerWon, onOtherPlayerWon, onGameResult, get active() { return state.active; } };
