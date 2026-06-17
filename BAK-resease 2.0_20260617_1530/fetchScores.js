/* =========================================================
fetchScores.js
CLEANED VERSION (no functional change, single-write only)

- Keeps score1 / score2 naming
- Keeps all logic intact
- Removes unused per-match writes
- Keeps summary doc as single source of truth
========================================================= */

/* =========================
CONFIG
========================= */
const MATCH_COMPLETE_WINDOW_MS = 105 * 60 * 1000;

/* =========================
DATE HELPERS
========================= */
function formatDateYYYYMMDD(date) {
  return (
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0")
  );
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/* =========================
STRING HELPERS
========================= */
function stripDiacritics(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeTeamName(name) {
  let s = stripDiacritics(name)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/-/g, " ")
    .replace(/[.'’]/g, "")
    .replace(/\s+/g, " ");

  const aliases = {
    "united states": "usa",
    "usmnt": "usa",
    "south korea": "korea republic",
    "bosnia herzegovina": "bosnia and herzegovina",
    "ivory coast": "cote divoire",
    "cote d ivoire": "cote divoire",
    "cape verde": "cabo verde",
    "iran": "ir iran",
    "dr congo": "congo dr",
    "turkey": "turkiye"
  };

  return aliases[s] || s;
}

function buildPairKey(teamA, teamB) {
  return normalizeTeamName(teamA) + "|" + normalizeTeamName(teamB);
}

/* =========================
RESULT HELPERS
========================= */
function hasResultChanged(existing, incoming) {
  const prev = existing || {};
  return (
    prev.status !== incoming.status ||
    Number(prev.score1 ?? null) !== Number(incoming.score1 ?? null) ||
    Number(prev.score2 ?? null) !== Number(incoming.score2 ?? null) ||
    prev.outcome !== incoming.outcome
  );
}

function deriveOutcome(score1, score2) {
  if (score1 > score2) return "team1";
  if (score1 < score2) return "team2";
  return "tie";
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/* =========================
ELIGIBLE MATCHES
========================= */
function getEligibleMatches(results, matches, nowMs) {
  const eligible = [];

  matches.forEach(matchMeta => {
    const matchId = matchMeta.id;
    const result = results[matchId] || {};

    if (result.status === "completed") return;

    const kickoffMs = new Date(matchMeta.kickoffEdt).getTime();
    if (!Number.isFinite(kickoffMs)) return;

    const completeThreshold = kickoffMs + MATCH_COMPLETE_WINDOW_MS;

    if (nowMs > completeThreshold) {
      eligible.push({ matchId, matchMeta });
    }
  });

  return eligible;
}

/* =========================
DATE KEYS
========================= */
function getDateKeysForEligibleMatches(eligibleMatches) {
  const keys = new Set();

  eligibleMatches.forEach(item => {
    const kickoffDate = new Date(item.matchMeta.kickoffEdt);
    keys.add(formatDateYYYYMMDD(kickoffDate));
    keys.add(formatDateYYYYMMDD(addDays(kickoffDate, 1)));
  });

  return Array.from(keys).sort();
}

/* =========================
FETCH ESPN
========================= */
async function fetchEspnScoreboardForDateKey(dateKey) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`ESPN fetch failed for ${dateKey}`);
  }
  const data = await res.json();
  return data.events || [];
}

function getEspnEventPayload(event) {
  const competition = event.competitions?.[0];
  const comps = competition?.competitors || [];
  if (comps.length < 2) return null;

  const home = comps.find(c => c.homeAway === "home") || comps[0];
  const away = comps.find(c => c.homeAway === "away") || comps[1];

  return {
    homeName: home?.team?.displayName,
    awayName: away?.team?.displayName,
    homeScore: toNumberOrNull(home?.score),
    awayScore: toNumberOrNull(away?.score),
    completed: Boolean(event?.status?.type?.completed)
  };
}

/* =========================
FETCH SCORE MAP
========================= */
async function fetchScoresFromESPN(dateKeys) {
  const map = {};

  for (const key of dateKeys) {
    try {
      const events = await fetchEspnScoreboardForDateKey(key);

      events.forEach(event => {
        const payload = getEspnEventPayload(event);
        if (!payload) return;

        const {
          homeName,
          awayName,
          homeScore,
          awayScore,
          completed
        } = payload;

        if (!homeName || !awayName) return;

        const keyA = buildPairKey(homeName, awayName);
        const keyB = buildPairKey(awayName, homeName);

        const result = {
          score1: homeScore,
          score2: awayScore,
          outcome: deriveOutcome(homeScore, awayScore),
          status: completed ? "completed" : "pending",
          completed_at: new Date().toISOString()
        };

        map[keyA] = result;
        map[keyB] = {
          score1: awayScore,
          score2: homeScore,
          outcome: deriveOutcome(awayScore, homeScore),
          status: result.status,
          completed_at: result.completed_at
        };
      });
    } catch (e) {
      console.error("ESPN fetch error:", key, e);
    }
  }

  return map;
}

/* =========================
MAIN SYNC
========================= */
async function syncPendingMatchResults(db, matches) {
  const mainRef = db.collection("matchResults").doc("main");
  const snap = await mainRef.get();

  const data = snap.exists ? snap.data() : {};
  const results = data.results || {};

  const nowMs = Date.now();
  const eligible = getEligibleMatches(results, matches, nowMs);

  if (eligible.length === 0) {
    return { updated: 0 };
  }

  const keys = getDateKeysForEligibleMatches(eligible);
  const espnMap = await fetchScoresFromESPN(keys);

  let updatedCount = 0;

  eligible.forEach(item => {
    const { matchId, matchMeta } = item;

    const lookupKey = buildPairKey(
      matchMeta.ESPN_team1 || matchMeta.team1,
      matchMeta.ESPN_team2 || matchMeta.team2
    );

    const incoming = espnMap[lookupKey];
    if (!incoming) return;

    if (incoming.score1 === null || incoming.score2 === null) return;

    if (incoming.status !== "completed") return;
    
    const existing = results[matchId] || {};

    const next = {
      match_id: matchId,
      team1: matchMeta.team1,
      team2: matchMeta.team2,
      score1: incoming.score1,
      score2: incoming.score2,
      outcome: incoming.outcome,
      status: incoming.status,
      completed_at:
        incoming.status === "completed"
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString()
    };

    if (!hasResultChanged(existing, next)) return;

    results[matchId] = next;
    updatedCount++;
  });

  if (updatedCount > 0) {
    await mainRef.set({
      results: results,
      updated_at: new Date().toISOString()
    });
  }

  return { updated: updatedCount };
}

/* =========================
EXPOSE GLOBAL
========================= */
window.fetchScoresFromESPN = fetchScoresFromESPN;
window.syncPendingMatchResults = syncPendingMatchResults;
