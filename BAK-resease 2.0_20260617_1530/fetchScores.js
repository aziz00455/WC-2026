/* =========================================================
fetchScores.js
Full sync workflow for World Cup match results

Exposes:
  window.syncPendingMatchResults(db, matches)
  window.fetchScoresFromESPN(dateKeys)

Requirements:
  - Firebase Firestore already initialized
  - matches.js already loaded
  - matches entries contain:
      id, kickoffEdt, ESPN_team1, ESPN_team2
========================================================= */

/* =========================
CONFIG
========================= */
const MATCH_COMPLETE_WINDOW_MS = 105 * 60 * 1000; // 105 mins

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
STRING / TEAM HELPERS
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

  // Canonical aliases for ESPN vs your matches.js naming
  const aliases = {
    "united states": "usa",
    "usmnt": "usa",
    "south korea": "korea republic",
    "bosnia herzegovina": "bosnia and herzegovina",
    "bosnia herzgovina": "bosnia and herzegovina",
    "ivory coast": "cote divoire",
    "cote d ivoire": "cote divoire",
    "cote divoire": "cote divoire",
    "cape verde": "cabo verde",
    "iran": "ir iran",
    "dr congo": "congo dr",
    "democratic republic of congo": "congo dr",
    "turkiye": "turkiye",
    "turkey": "turkiye",
    "curacao": "curacao"
  };

  return aliases[s] || s;
}

function buildPairKey(teamA, teamB) {
  return normalizeTeamName(teamA) + "|" + normalizeTeamName(teamB);
}

/* =========================
RESULT HELPERS
========================= */
function isCompletedStatus(status) {
  return status === "completed";
}

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
FIND ELIGIBLE MATCHES
Criteria:
- match result not completed
- now >= kickoffEdt
========================= */
function getEligibleMatches(results, matches, nowMs) {
  const eligible = [];

  matches.forEach(matchMeta => {
    const matchId = matchMeta.id;
    const result = results[matchId] || {};

    // ✅ Skip already completed
    if (result.status === "completed") return;

    const kickoffMs = new Date(matchMeta.kickoffEdt).getTime();
    if (!Number.isFinite(kickoffMs)) return;

    const completeThreshold = kickoffMs + MATCH_COMPLETE_WINDOW_MS;

    // ✅ NEW LOGIC (your requirement)
    if (nowMs > completeThreshold) {
      eligible.push({
        matchId,
        result,
        matchMeta
      });
    }
  });

  return eligible;
}

/* =========================
BUILD DATE KEYS TO FETCH
Important:
ESPN scoreboard buckets by UTC date.
For late-night EDT matches, the same match may appear on the next UTC day.
So for each eligible match, fetch:
- local kickoff date
- local kickoff date + 1 day
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
FETCH ESPN SCOREBOARD
========================= */
async function fetchEspnScoreboardForDateKey(dateKey) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`ESPN fetch failed for ${dateKey}: ${res.status}`);
  }

  const data = await res.json();
  return data.events || [];
}

/* =========================
READ ESPN EVENT STATUS / SCORES
========================= */
function getEspnEventPayload(event) {
  const competition = (event.competitions && event.competitions[0]) || null;
  const competitors = (competition && competition.competitors) || [];
  if (competitors.length < 2) return null;

  // ESPN usually exposes home/away. We create both directions below.
  const home =
    competitors.find(c => c.homeAway === "home") || competitors[0];
  const away =
    competitors.find(c => c.homeAway === "away") || competitors[1];

  const homeName =
    home?.team?.displayName ||
    home?.team?.shortDisplayName ||
    home?.team?.name ||
    null;

  const awayName =
    away?.team?.displayName ||
    away?.team?.shortDisplayName ||
    away?.team?.name ||
    null;

  const homeScore = toNumberOrNull(home?.score);
  const awayScore = toNumberOrNull(away?.score);

  const completed =
    Boolean(event?.status?.type?.completed) ||
    Boolean(competition?.status?.type?.completed) ||
    String(event?.status?.type?.name || "").toUpperCase() === "STATUS_FINAL" ||
    String(competition?.status?.type?.name || "").toUpperCase() === "STATUS_FINAL";

  const detail =
    event?.status?.type?.detail ||
    competition?.status?.type?.detail ||
    event?.status?.type?.shortDetail ||
    competition?.status?.type?.shortDetail ||
    "";

  return {
    homeName,
    awayName,
    homeScore,
    awayScore,
    completed,
    detail
  };
}

/* =========================
SCRAPE SCORE MAP
Returns:
{
  "Team A|Team B": {
    score1,
    score2,
    status,
    outcome,
    completed_at
  }
}
Key order is aligned to the key order, not necessarily ESPN home/away order.
========================= */
async function fetchScoresFromESPN(dateKeys) {
  const map = {};

  for (const dateKey of dateKeys) {
    try {
      const events = await fetchEspnScoreboardForDateKey(dateKey);

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

        // Forward order
        const keyForward = buildPairKey(homeName, awayName);
        map[keyForward] = {
          score1: homeScore,
          score2: awayScore,
          status: completed ? "completed" : "in_progress",
          outcome:
            homeScore !== null && awayScore !== null
              ? deriveOutcome(homeScore, awayScore)
              : null,
          completed_at: completed ? new Date().toISOString() : null
        };

        // Reverse order (swap scores and swap outcome)
        const keyReverse = buildPairKey(awayName, homeName);
        let reverseOutcome = null;
        if (homeScore !== null && awayScore !== null) {
          if (awayScore > homeScore) reverseOutcome = "team1";
          else if (awayScore < homeScore) reverseOutcome = "team2";
          else reverseOutcome = "tie";
        }

        map[keyReverse] = {
          score1: awayScore,
          score2: homeScore,
          status: completed ? "completed" : "in_progress",
          outcome: reverseOutcome,
          completed_at: completed ? new Date().toISOString() : null
        };
      });
    } catch (err) {
      console.error("ESPN fetch error for", dateKey, err);
    }
  }

  return map;
}

/* =========================
MAIN SYNC FUNCTION
- Reads summary doc matchResults/main
- Computes eligible matches
- Fetches ESPN dates
- Updates:
    1) matchResults/main.results[matchId]
    2) matchResults/{matchId}
========================= */
async function syncPendingMatchResults(db, matches) {
  if (!db) throw new Error("syncPendingMatchResults: db is required");
  if (!Array.isArray(matches)) {
    throw new Error("syncPendingMatchResults: matches array is required");
  }

  const mainRef = db.collection("matchResults").doc("main");
  const mainSnap = await mainRef.get();

  const mainData = mainSnap.exists ? (mainSnap.data() || {}) : {};
  const results = mainData.results || {};
  const nowMs = Date.now();

  const eligibleMatches = getEligibleMatches(results, matches, nowMs);

  if (eligibleMatches.length === 0) {
    return {
      updated: 0,
      checked: Object.keys(results).length,
      eligible: 0,
      changed: false
    };
  }

  const dateKeys = getDateKeysForEligibleMatches(eligibleMatches);
  const espnMap = await fetchScoresFromESPN(dateKeys);

  const updatedResults = { ...results };
  const perMatchWrites = [];
  let updatedCount = 0;

  eligibleMatches.forEach(item => {
    const { matchId, matchMeta } = item;

    const lookupKey = buildPairKey(
      matchMeta.ESPN_team1 || matchMeta.team1,
      matchMeta.ESPN_team2 || matchMeta.team2
    );

    const incoming = espnMap[lookupKey];
    if (!incoming) return;

    // Only update if we have scores
    if (incoming.score1 === null || incoming.score2 === null) return;

    const existing = updatedResults[matchId] || {};

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
          ? incoming.completed_at || existing.completed_at || new Date().toISOString()
          : existing.completed_at || null,
      updated_at: new Date().toISOString()
    };

    if (!hasResultChanged(existing, next)) return;

    updatedResults[matchId] = next;
    updatedCount++;

    // Queue per-match doc write as well
    perMatchWrites.push({
      ref: db.collection("matchResults").doc(matchId),
      data: next
    });
  });

  if (updatedCount > 0) {
    // 1) Update summary doc for landing.html
    await mainRef.set(
      {
        results: updatedResults,
        updated_at: new Date().toISOString()
      },
      { merge: true }
    );

    // 2) Dual-write individual docs for other pages
    const batch = db.batch();
    perMatchWrites.forEach(item => {
      batch.set(item.ref, item.data, { merge: true });
    });
    await batch.commit();
  }

  return {
    updated: updatedCount,
    checked: Object.keys(results).length,
    eligible: eligibleMatches.length,
    changed: updatedCount > 0
  };
}

/* =========================
EXPOSE GLOBALS
========================= */
window.fetchScoresFromESPN = fetchScoresFromESPN;
window.syncPendingMatchResults = syncPendingMatchResults;
