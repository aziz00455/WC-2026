/*
:  syncResults.js
    1. Load matches.js first
    2. Load this file next
    3. Call:
         await syncResultsFromAPI(db, matches);

  Requirements:
    - Firebase Firestore instance already initialized as `db`
    - matches.js already loaded and defines: const matches = [...]
    - Replace YOUR_API_SPORTS_KEY below
*/

const API_KEY = "YOUR_API_SPORTS_KEY";
const API_BASE_URL = "https://v3.football.api-sports.io";
const API_SEASON = 2026;
const API_TIMEZONE = "America/New_York";

// API-Football completed statuses
const COMPLETED_STATUSES = new Set(["FT", "AET", "PEN"]);

// -----------------------------
// Team name normalization
// -----------------------------
function normalizeTeamName(name) {
  if (!name) return "";

  const value = name.trim().toLowerCase();

  const aliases = {
    "south korea": "korea republic",
    "korea republic": "korea republic",

    "czech republic": "czechia",
    "czechia": "czechia",

    "ivory coast": "côte d'ivoire",
    "cote d'ivoire": "côte d'ivoire",
    "côte d'ivoire": "côte d'ivoire",

    "curacao": "curaçao",
    "curaçao": "curaçao",

    "turkey": "türkiye",
    "turkiye": "türkiye",
    "türkiye": "türkiye",

    "cape verde": "cabo verde",
    "cabo verde": "cabo verde",

    "iran": "ir iran",
    "ir iran": "ir iran",

    "dr congo": "congo dr",
    "congo dr": "congo dr",

    "united states": "usa",
    "usa": "usa"
  };

  return aliases[value] || value;
}

// -----------------------------
// Helpers
// -----------------------------
function getOutcome(score1, score2) {
  if (score1 > score2) return "team1";
  if (score2 > score1) return "team2";
  return "tie";
}

function getDatePart(isoString) {
  return String(isoString).slice(0, 10);
}

function getCompletedAtFromKickoff(kickoffIso) {
  const kickoffMs = new Date(kickoffIso).getTime();
  const completedMs = kickoffMs + (95 * 60 * 1000); // 95 minutes after kickoff
  return new Date(completedMs).toISOString();
}

// -----------------------------
// Build internal index from matches.js
// key = date|team1|team2
// -----------------------------
function buildMatchIndex(matches) {
  const index = {};

  matches.forEach(match => {
    const key = [
      match.date,
      normalizeTeamName(match.team1),
      normalizeTeamName(match.team2)
    ].join("|");

    index[key] = match;
  });

  return index;
}

// -----------------------------
// Pull fixtures from API-Football
// The official docs describe the fixtures endpoint and support
// parameters like season, from, to, date, and timezone. 
// -----------------------------
async function fetchFixtures(fromDate, toDate) {
  const url =
    `${API_BASE_URL}/fixtures` +
    `?season=${encodeURIComponent(API_SEASON)}` +
    `&from=${encodeURIComponent(fromDate)}` +
    `&to=${encodeURIComponent(toDate)}` +
    `&timezone=${encodeURIComponent(API_TIMEZONE)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  const json = await response.json();

  if (!json || !Array.isArray(json.response)) {
    throw new Error("Unexpected API response shape");
  }

  return json.response;
}

// -----------------------------
// Convert one fixture object to your Firestore schema
// -----------------------------
function buildResultDoc(match, fixture) {
  const shortStatus =
    fixture.fixture &&
    fixture.fixture.status &&
    fixture.fixture.status.short
      ? fixture.fixture.status.short
      : "";

  const isCompleted = COMPLETED_STATUSES.has(shortStatus);

  const score1 =
    isCompleted &&
    fixture.goals &&
    fixture.goals.home != null
      ? fixture.goals.home
      : null;

  const score2 =
    isCompleted &&
    fixture.goals &&
    fixture.goals.away != null
      ? fixture.goals.away
      : null;

  const outcome =
    isCompleted && score1 != null && score2 != null
      ? getOutcome(score1, score2)
      : "pending";

  return {
    match_id: match.id,
    team1: match.team1,
    team2: match.team2,
    score1: score1,
    score2: score2,
    outcome: outcome,
    status: isCompleted ? "completed" : "pending",
    completed_at: isCompleted
      ? getCompletedAtFromKickoff(fixture.fixture.date)
      : null,

    // helpful audit/debug fields
    fixture_api_id:
      fixture.fixture && fixture.fixture.id ? fixture.fixture.id : null,
    api_status: shortStatus || null,
    updated_at: new Date().toISOString()
  };
}

// -----------------------------
// Main exported sync function
// -----------------------------
async function syncResultsFromAPI(db, matches) {
  if (!db) {
    throw new Error("syncResultsFromAPI: Firestore db is required");
  }

  if (!Array.isArray(matches) || matches.length === 0) {
    throw new Error("syncResultsFromAPI: matches array is required");
  }

  if (!API_KEY || API_KEY === "YOUR_API_SPORTS_KEY") {
    throw new Error("syncResultsFromAPI: set your real API key first");
  }

  // Determine date range from your schedule
  const dates = matches.map(m => m.date).sort();
  const fromDate = dates[0];
  const toDate = dates[dates.length - 1];

  const matchIndex = buildMatchIndex(matches);
  const fixtures = await fetchFixtures(fromDate, toDate);

  let batch = db.batch();
  let writeCount = 0;
  let syncedCount = 0;

  fixtures.forEach(fixture => {
    const fixtureDate =
      fixture.fixture && fixture.fixture.date
        ? getDatePart(fixture.fixture.date)
        : "";

    const homeName =
      fixture.teams && fixture.teams.home && fixture.teams.home.name
        ? normalizeTeamName(fixture.teams.home.name)
        : "";

    const awayName =
      fixture.teams && fixture.teams.away && fixture.teams.away.name
        ? normalizeTeamName(fixture.teams.away.name)
        : "";

    const key = [fixtureDate, homeName, awayName].join("|");
    const match = matchIndex[key];

    // Skip anything we can't map to your internal fixture list
    if (!match) return;

    const data = buildResultDoc(match, fixture);
    const ref = db.collection("matchResults").doc(match.id);

    batch.set(ref, data, { merge: true });
    writeCount++;
    syncedCount++;
  });

  if (writeCount > 0) {
    await batch.commit();
  }

  return {
    synced: syncedCount,
    from: fromDate,
    to: toDate
  };
}

// expose globally for browser use
window.syncResultsFromAPI = syncResultsFromAPI;
``

