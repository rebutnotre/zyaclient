import { getSettings } from "./settings.js";
import { getVar } from "./gameInterface.js";

// Example usage from game script: __fx.utils.getMaxTroops(...)

function getMaxTroops(playerTerritories, playerID) {
    return (playerTerritories[playerID] * 150).toString();
};
function getDensity(playerID, playerBalances = getVar("playerBalances"), playerTerritories = getVar("playerTerritories")) {
    if (getSettings().densityDisplayStyle === "percentage") return (((playerBalances[playerID] / ((playerTerritories[playerID] === 0 ? 1 : playerTerritories[playerID]) * 150)) * 100).toFixed(1) + "%");
    else return (playerBalances[playerID] / (playerTerritories[playerID] === 0 ? 1 : playerTerritories[playerID])).toFixed(1);
};
function isPointInRectangle(x, y, rectangleStartX, rectangleStartY, width, height) {
    return x >= rectangleStartX && x <= rectangleStartX + width && y >= rectangleStartY && y <= rectangleStartY + height;
};
/** @param {CanvasRenderingContext2D} canvas @param {string} text */
function fillTextMultiline(canvas, text, x, y, maxWidth) {
    const lineHeight = parseInt(canvas.font.split(" ").find(part => part.endsWith("px")).slice(0, -2));
    text.split("\n").forEach((line, index) => canvas.fillText(line, x, y + index * lineHeight, maxWidth));
}
function textStyleBasedOnDensity(playerID) {
    const playerBalances = getVar("playerBalances"), playerTerritories = getVar("playerTerritories");
    return `hsl(${playerBalances[playerID] / (playerTerritories[playerID] * 1.5)}, 100%, 50%, 1)`;
}
// specific color pallete so two ips dont have a similar looking color
const duplicateIpColorPalette = [
    "hsla(0, 85%, 50%, 0.5)",   // red
    "hsla(210, 85%, 55%, 0.5)", // blue
    "hsla(130, 70%, 45%, 0.5)", // green
    "hsla(45, 90%, 55%, 0.5)",  // amber
    "hsla(280, 75%, 60%, 0.5)", // purple
    "hsla(185, 80%, 50%, 0.5)", // cyan
    "hsla(320, 80%, 60%, 0.5)", // pink
    "hsla(25, 85%, 50%, 0.5)",  // orange
    "hsla(160, 60%, 40%, 0.5)", // teal
    "hsla(255, 60%, 65%, 0.5)", // indigo
];

function hashInt(n) {
    n = (n ^ (n >>> 16)) >>> 0;
    n = Math.imul(n, 0x45d9f3b) >>> 0;
    n = (n ^ (n >>> 16)) >>> 0;
    n = Math.imul(n, 0x45d9f3b) >>> 0;
    return (n ^ (n >>> 16)) >>> 0;
}

let cachedTeams = null;
let cachedTeamsKey = null;
let cachedIpCounts = null;

function getIpCounts(teams, ipField) {
    const key = ipField + "|" + teams.map(team => team.length).join(",");
    if (cachedTeams === teams && cachedTeamsKey === key) return cachedIpCounts;
    const counts = new Map();
    teams.forEach(team => team.forEach(entry => {
        const ip = entry[ipField];
        if (ip === undefined) return;
        counts.set(ip, (counts.get(ip) || 0) + 1);
    }));
    cachedTeams = teams;
    cachedTeamsKey = key;
    cachedIpCounts = counts;
    return counts;
}

function getDuplicateIpHighlightColor(player, teams, ipField) {
    const ip = player[ipField];
    if (ip === undefined) return null;
    if ((getIpCounts(teams, ipField).get(ip) || 0) < 2) return null;
    return duplicateIpColorPalette[hashInt(ip) % duplicateIpColorPalette.length];
}

export default { getMaxTroops, getDensity, isPointInRectangle, fillTextMultiline, textStyleBasedOnDensity, getDuplicateIpHighlightColor }