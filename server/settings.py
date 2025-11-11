from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

SQLITE_PATH = DATA_DIR / "football_odds.sqlite"
SCHEMA_PATH = BASE_DIR / "schema.sql"

SPORTTERY_API_URL = "https://webapi.sporttery.cn/gateway/uniform/football/getMatchCalculatorV1.qry"
POOL_CODES = {
    "had_hhad": "hhad,had",
    "crs": "crs",
    "ttg": "ttg",
    "hafu": "hafu",
}

SYNC_INTERVAL_SECONDS = 600  # 10分钟
HTTP_TIMEOUT = 20
USER_AGENT = "football-rational-betting-tracker/1.0"
