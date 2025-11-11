import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path

from . import settings

_DB_PATH = Path(settings.SQLITE_PATH)
_SCHEMA = Path(settings.SCHEMA_PATH)


def init_db() -> None:
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(_DB_PATH)
    try:
        with open(_SCHEMA, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
    finally:
        conn.close()


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def get_db():
    conn = _connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def touch_sync_status(conn: sqlite3.Connection) -> None:
    conn.execute(
        "INSERT OR IGNORE INTO sync_status (id, last_synced_at, total_matches, total_odds) VALUES (1, NULL, 0, 0)"
    )


def update_sync_status(conn: sqlite3.Connection, total_matches: int, total_odds: int) -> None:
    now = datetime.utcnow().isoformat()
    touch_sync_status(conn)
    conn.execute(
        "UPDATE sync_status SET last_synced_at = ?, total_matches = ?, total_odds = ? WHERE id = 1",
        (now, total_matches, total_odds),
    )


def fetch_sync_status():
    with get_db() as conn:
        touch_sync_status(conn)
        cur = conn.execute("SELECT last_synced_at, total_matches, total_odds FROM sync_status WHERE id = 1")
        row = cur.fetchone()
        if row:
            return dict(row)
        return {"last_synced_at": None, "total_matches": 0, "total_odds": 0}
