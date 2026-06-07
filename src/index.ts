interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * OpenLigaDB MCP — community-run, keyless football / soccer match data.
 * Covers German football leagues (Bundesliga, 2. Bundesliga, 3. Liga, DFB-Pokal)
 * and others: match results / scores, fixtures, and league table / standings.
 */


const BASE = 'https://api.openligadb.de';
const HEADERS = {
  'User-Agent': 'pipeworx/1.0 (+https://pipeworx.io)',
  Accept: 'application/json',
};

const LEAGUE_HINT =
  "League shortcut, e.g. 'bl1' (Bundesliga), 'bl2' (2. Bundesliga), 'bl3' (3. Liga), 'dfb' (DFB-Pokal).";

const tools: McpToolExport['tools'] = [
  {
    name: 'list_leagues',
    description:
      'List all available football / soccer leagues and seasons in OpenLigaDB (German football leagues like the Bundesliga, plus others). Returns league id, name, shortcut, season, and sport.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_matches',
    description:
      'Get football / soccer match results / scores and fixtures for a league and season (e.g. Bundesliga). Optionally narrow to a single matchday. Returns teams, kickoff datetime, final score, and whether each match is finished.',
    inputSchema: {
      type: 'object',
      properties: {
        league: { type: 'string', description: LEAGUE_HINT },
        season: { type: 'string', description: 'Season start year, e.g. "2024".' },
        matchday: { type: 'number', description: 'Optional matchday number (1-based).' },
      },
      required: ['league', 'season'],
    },
  },
  {
    name: 'get_table',
    description:
      'Get the league table / standings for a football / soccer league and season (e.g. the Bundesliga table). Returns each team\'s position, played, won, draw, lost, goals, goal difference, and points.',
    inputSchema: {
      type: 'object',
      properties: {
        league: { type: 'string', description: LEAGUE_HINT },
        season: { type: 'string', description: 'Season start year, e.g. "2024".' },
      },
      required: ['league', 'season'],
    },
  },
  {
    name: 'current_matchday',
    description:
      'Get the current matchday\'s football / soccer matches (results / scores) for a league (e.g. this week\'s Bundesliga fixtures) in the current season.',
    inputSchema: {
      type: 'object',
      properties: {
        league: { type: 'string', description: LEAGUE_HINT },
      },
      required: ['league'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'list_leagues': {
      const data = (await ligaGet('/getavailableleagues')) as LeagueRaw[];
      return (data || []).map((l) => ({
        id: l.leagueId,
        name: l.leagueName,
        shortcut: l.leagueShortcut,
        season: l.leagueSeason,
        sport: l.sport?.sportName,
      }));
    }
    case 'get_matches': {
      const league = reqStr(args, 'league', "'bl1'");
      const season = reqStr(args, 'season', "'2024'");
      const matchday = args.matchday;
      const segs = [enc(league), enc(season)];
      if (matchday !== undefined && matchday !== null) segs.push(enc(String(matchday)));
      const data = (await ligaGet(`/getmatchdata/${segs.join('/')}`)) as MatchRaw[];
      return { matches: mapMatches(data) };
    }
    case 'get_table': {
      const league = reqStr(args, 'league', "'bl1'");
      const season = reqStr(args, 'season', "'2024'");
      const data = (await ligaGet(`/getbltable/${enc(league)}/${enc(season)}`)) as TableRaw[];
      return (data || []).map((t, i) => ({
        position: i + 1,
        team: t.teamName,
        played: t.matches,
        won: t.won,
        draw: t.draw,
        lost: t.lost,
        goals: t.goals,
        opponent_goals: t.opponentGoals,
        goal_diff: t.goalDiff,
        points: t.points,
      }));
    }
    case 'current_matchday': {
      const league = reqStr(args, 'league', "'bl1'");
      const data = (await ligaGet(`/getmatchdata/${enc(league)}`)) as MatchRaw[];
      return { matches: mapMatches(data) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function mapMatches(data: MatchRaw[]): unknown[] {
  return (data || []).map((m) => {
    const results = m.matchResults;
    const last = results && results.length ? results[results.length - 1] : undefined;
    return {
      id: m.matchID,
      matchday: m.group?.groupOrderID,
      datetime: m.matchDateTime,
      team1: m.team1?.teamName,
      team2: m.team2?.teamName,
      finished: m.matchIsFinished,
      goals1: last?.pointsTeam1,
      goals2: last?.pointsTeam2,
      location: m.location?.locationStadium,
    };
  });
}

async function ligaGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) {
    const message = await res.text().then((t) => t.slice(0, 500)).catch(() => '');
    return { error: res.status, message };
  }
  return res.json();
}

function enc(s: string): string {
  return encodeURIComponent(s);
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim())
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

interface LeagueRaw {
  leagueId?: number;
  leagueName?: string;
  leagueShortcut?: string;
  leagueSeason?: string;
  sport?: { sportName?: string };
}

interface MatchResultRaw {
  pointsTeam1?: number;
  pointsTeam2?: number;
}

interface MatchRaw {
  matchID?: number;
  group?: { groupOrderID?: number };
  matchDateTime?: string;
  team1?: { teamName?: string };
  team2?: { teamName?: string };
  matchIsFinished?: boolean;
  matchResults?: MatchResultRaw[];
  location?: { locationStadium?: string };
}

interface TableRaw {
  teamName?: string;
  matches?: number;
  won?: number;
  draw?: number;
  lost?: number;
  goals?: number;
  opponentGoals?: number;
  goalDiff?: number;
  points?: number;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
