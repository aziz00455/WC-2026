/*
  syncResults.js

  Usage in landing.html:
    <script src="matches.js"></script>
    <script src="syncResults.js"></script>
    ...
    await syncResultsFromAPI(db, matches);

  IMPORTANT:
  - Replace YOUR_API_SPORTS_KEY with your real key.
  - matches.js must be loaded before this file.
  - Firebase db instance must already exist.
*/

const API_SPORTS_KEY = "YOUR_API_SPORTS_KEY"; // <-- replace this
const API_SPORTS_BASE = "https://v3.football.api-sports.io";
const API_TIMEZONE = "America/New_York";
const API_SEASON = 2026;

// Completed statuses we treat as final
const COMPLETED_STATUS_CODES = new Set(["FT", "AET", "PEN"]);

// -----------------------------
// Name normalization
// -----------------------------
function normalizeTeamName(name) {
  if (!name) return "";

  const v = name.trim().toLowerCase();

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

  return aliases[v] || v;
}

// -----------------------------
// Helpers
// -----------------------------
function scoreToOutcome(score1, score2) {
  if (score1 > score2) return "team1";
  if (score2 > score1) return "team2";
  return "tie";
}

function getDatePart(isoLike) {
  // Returns YYYY-MM-DD from an ISO string or date-like string
  return String(isoLike).slice(0, 10);
}

function formatCompletionTimeFromFixture(fixtureObj) {
  // Prefer fixture date if API has it; if completed, it is the match kickoff time,
  // so we approximate completion_at by adding 95 minutes to kickoff.
  // This matches your existing logic for completion timestamp.
  const kickoff = new Date(fixtureObj.fixture.date).getTime();
  const completedAt = kickoff + (95 * 60 * 1000);
  return new Date(completedAt).toISOString();
}

// -----------------------------
// Build an index from your matches.js
// Key: date|team1|team2
// -----------------------------
function buildInternalMatchIndex(matches) {
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
// Fetch fixtures from API-Football
// We query by date range + season + timezone.
// Official docs show the fixtures endpoint and these parameters. [1](https://www.api-football.com/documentation-v3)[2](https://api-sports.io/documentation/football/v3)[3](https://www.educative.io/courses/getting-soccer-data-with-api-football-in-javascript/fixtures-information)
// -----------------------------
async function fetchFixturesRange(fromDate, toDate) {
  const url =
    `${API_SPORTS_BASE}/fixtures` +
    `?from=${encodeURIComponent(fromDate)}` +
    `&to=${encodeURIComponent(toDate)}` +
    `&season=${encodeURIComponent(API_SEASON)}` +
    `&timezone=${encodeURIComponent(API_TIMEZONE)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": API_SPORTS_KEY
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API-Football error ${response.status}: ${body}`);
  }

  const json = await response.json();

  if (!json || !Array.isArray(json.response)) {
    throw new Error("Unexpected API-Football response shape");
  }

  return json.response;
}

// -----------------------------
// Convert one API fixture -> your Firestore schema
// -----------------------------
function buildResultDoc(match, fixtureObj) {
  const homeGoals = fixtureObj.goals && fixtureObj.goals.home != null
    ? fixtureObj.goals.home
    : null;

  const awayGoals = fixtureObj.goals && fixtureObj.goals.away != null
    ? fixtureObj.goals.away
    : null;

  const shortStatus =
    fixtureObj.fixture &&
    fixtureObj.fixture.status &&
    fixtureObj.fixture.status.short
      ? fixtureObj.fixture.status.short
      : "";

  const isCompleted = COMPLETED_STATUS_CODES.has(shortStatus);

  let outcome = "pending";
  if (isCompleted && homeGoals != null && awayGoals != null) {
    outcome = scoreToOutcome(homeGoals, awayGoals);
  }

  return {
    match_id: match.id,
    team1: match.team1,
    team2: match.team2,
    score1: isCompleted ? homeGoals : null,
    score2: isCompleted ? awayGoals : null,
    outcome: isCompleted ? outcome : "pending",
    status: isCompleted ? "completed" : "pending",
    completed_at: isCompleted ? formatCompletionTimeFromFixture(fixtureObj) : null,
    fixture_api_id:
      fixtureObj.fixture && fixtureObj.fixture.id ? fixtureObj.fixture.id : null,
    api_status: shortStatus || null,
    updated_at: new Date().toISOString()
  };
}

// -----------------------------
// Main sync function
// -----------------------------
async function syncResultsFromAPI(db, matches) {
  if (!db) throw new Error("syncResultsFromAPI: db is required");
  if (!Array.isArray(matches) || matches.length === 0) {
    throw new Error("syncResultsFromAPI: matches array is required");
  }
  if (!API_SPORTS_KEY || API_SPORTS_KEY === "YOUR_API_SPORTS_KEY") {
    throw new Error("syncResultsFromAPI: set your real API_SPORTS_KEY first");
  }

  // Determine date range from your internal schedule
  const allDates = matches.map(m => m.date).sort();
  const fromDate = allDates[0];
  const toDate = allDates[allDates.length - 1];

  // Build internal lookup
  const internalIndex = buildInternalMatchIndex(matches);

  // Pull fixtures from API
  const fixtures = await fetchFixturesRange(fromDate, toDate);

  // Batch writes to Firestore
  let batch = db.batch();
  let writes = 0;

  for (const fixtureObj of fixtures) {
    const fixtureDate = getDatePart(
      fixtureObj.fixture && fixtureObj.fixture.date
        ? fixtureObj.fixture.date
        : ""
    );

    const homeName =
      fixtureObj.teams && fixtureObj.teams.home && fixtureObj.teams.home.name
        ? normalizeTeamName(fixtureObj.teams.home.name)
        : "";

    const awayName =
      fixtureObj.teams && fixtureObj.teams.away && fixtureObj.teams.away.name
        ? normalizeTeamName(fixtureObj.teams.away.name)
        : "";

    const key = [fixtureDate, homeName, awayName].join("|");
    const match = internalIndex[key];

    // If no match found, skip silently
    if (!match) continue;

    const docData = buildResultDoc(match, fixtureObj);
    const ref = db.collection("matchResults").doc(match.id);

    batch.set(ref, docData, { merge: true });
    writes++;

    // Firestore batch limit safety
    if (writes % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }

  if (writes % 400 !== 0) {
    await batch.commit();
  }

  return { syncedMatches: writes, fromDate, toDate };
}

// Expose globally for browser use
window.syncResultsFromAPI = syncResultsFromAPI;
