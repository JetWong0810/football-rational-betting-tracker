PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS matches (
    match_id TEXT PRIMARY KEY,
    match_number TEXT,
    match_code TEXT,
    project_type TEXT DEFAULT 'football',
    league_id TEXT,
    league_name TEXT,
    league_full_name TEXT,
    match_date TEXT,
    match_time TEXT,
    match_timestamp INTEGER,
    home_team_id TEXT,
    home_team_name TEXT,
    home_team_rank TEXT,
    away_team_id TEXT,
    away_team_name TEXT,
    away_team_rank TEXT,
    is_single INTEGER DEFAULT 0,
    match_status TEXT,
    notice TEXT,
    odds_update_time TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS odds_win_draw_lose (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT NOT NULL,
    odds_type TEXT NOT NULL,
    handicap REAL DEFAULT 0,
    win_odds REAL,
    draw_odds REAL,
    lose_odds REAL,
    win_support REAL,
    draw_support REAL,
    lose_support REAL,
    is_single INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, odds_type),
    FOREIGN KEY(match_id) REFERENCES matches(match_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS odds_correct_score (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT NOT NULL,
    result_type TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    score_label TEXT,
    odds REAL,
    is_other INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, result_type, home_score, away_score, is_other),
    FOREIGN KEY(match_id) REFERENCES matches(match_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS odds_total_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT NOT NULL,
    goal_range TEXT NOT NULL,
    min_goals INTEGER,
    max_goals INTEGER,
    odds REAL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, goal_range),
    FOREIGN KEY(match_id) REFERENCES matches(match_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS odds_half_full_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT NOT NULL,
    half_result TEXT NOT NULL,
    full_result TEXT NOT NULL,
    result_label TEXT,
    odds REAL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, half_result, full_result),
    FOREIGN KEY(match_id) REFERENCES matches(match_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_status (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_synced_at TEXT,
    total_matches INTEGER DEFAULT 0,
    total_odds INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league_name);
CREATE INDEX IF NOT EXISTS idx_odds_wdl_match ON odds_win_draw_lose(match_id);
CREATE INDEX IF NOT EXISTS idx_odds_score_match ON odds_correct_score(match_id);
CREATE INDEX IF NOT EXISTS idx_odds_goals_match ON odds_total_goals(match_id);
CREATE INDEX IF NOT EXISTS idx_odds_hafu_match ON odds_half_full_time(match_id);
