from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional

from .database import get_db, update_sync_status


class OddsRepository:
    def upsert_match(self, match: Dict[str, Any]) -> None:
        fields = [
            "match_id",
            "match_number",
            "match_code",
            "project_type",
            "league_id",
            "league_name",
            "league_full_name",
            "match_date",
            "match_time",
            "match_timestamp",
            "home_team_id",
            "home_team_name",
            "home_team_rank",
            "away_team_id",
            "away_team_name",
            "away_team_rank",
            "is_single",
            "match_status",
            "notice",
            "odds_update_time",
        ]
        placeholders = ", ".join([f"{f}=excluded.{f}" for f in fields if f != "match_id"])
        columns = ", ".join(fields)
        values = [match.get(f) for f in fields]
        sql = f"""
            INSERT INTO matches ({columns}) VALUES ({', '.join(['?'] * len(fields))})
            ON CONFLICT(match_id) DO UPDATE SET {placeholders}, updated_at = CURRENT_TIMESTAMP
        """
        with get_db() as conn:
            conn.execute(sql, values)

    def upsert_odds_wdl(self, item: Dict[str, Any]) -> None:
        sql = """
            INSERT INTO odds_win_draw_lose (
                match_id, odds_type, handicap,
                win_odds, draw_odds, lose_odds,
                win_support, draw_support, lose_support, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(match_id, odds_type)
            DO UPDATE SET
                handicap=excluded.handicap,
                win_odds=excluded.win_odds,
                draw_odds=excluded.draw_odds,
                lose_odds=excluded.lose_odds,
                win_support=excluded.win_support,
                draw_support=excluded.draw_support,
                lose_support=excluded.lose_support,
                updated_at=CURRENT_TIMESTAMP
        """
        values = [
            item.get("match_id"),
            item.get("odds_type"),
            item.get("handicap"),
            item.get("win_odds"),
            item.get("draw_odds"),
            item.get("lose_odds"),
            item.get("win_support"),
            item.get("draw_support"),
            item.get("lose_support"),
        ]
        with get_db() as conn:
            conn.execute(sql, values)

    def upsert_odds_score_bulk(self, match_id: str, rows: Iterable[Dict[str, Any]]) -> None:
        rows = list(rows)
        if not rows:
            return
        with get_db() as conn:
            for row in rows:
                conn.execute(
                    """
                    INSERT INTO odds_correct_score (
                        match_id, result_type, home_score, away_score, score_label, odds, is_other, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(match_id, result_type, home_score, away_score, is_other)
                    DO UPDATE SET
                        odds=excluded.odds,
                        score_label=excluded.score_label,
                        updated_at=CURRENT_TIMESTAMP
                    """,
                    (
                        match_id,
                        row.get("result_type"),
                        row.get("home_score"),
                        row.get("away_score"),
                        row.get("score_label"),
                        row.get("odds"),
                        row.get("is_other", 0),
                    ),
                )

    def upsert_odds_goals_bulk(self, match_id: str, rows: Iterable[Dict[str, Any]]) -> None:
        rows = list(rows)
        if not rows:
            return
        with get_db() as conn:
            for row in rows:
                conn.execute(
                    """
                    INSERT INTO odds_total_goals (
                        match_id, goal_range, min_goals, max_goals, odds, updated_at
                    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(match_id, goal_range)
                    DO UPDATE SET
                        min_goals=excluded.min_goals,
                        max_goals=excluded.max_goals,
                        odds=excluded.odds,
                        updated_at=CURRENT_TIMESTAMP
                    """,
                    (
                        match_id,
                        row.get("goal_range"),
                        row.get("min_goals"),
                        row.get("max_goals"),
                        row.get("odds"),
                    ),
                )

    def upsert_odds_hafu_bulk(self, match_id: str, rows: Iterable[Dict[str, Any]]) -> None:
        rows = list(rows)
        if not rows:
            return
        with get_db() as conn:
            for row in rows:
                conn.execute(
                    """
                    INSERT INTO odds_half_full_time (
                        match_id, half_result, full_result, result_label, odds, updated_at
                    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(match_id, half_result, full_result)
                    DO UPDATE SET
                        result_label=excluded.result_label,
                        odds=excluded.odds,
                        updated_at=CURRENT_TIMESTAMP
                    """,
                    (
                        match_id,
                        row.get("half_result"),
                        row.get("full_result"),
                        row.get("result_label"),
                        row.get("odds"),
                    ),
                )

    def finalize_sync(self, total_matches: int, total_odds: int) -> None:
        with get_db() as conn:
            update_sync_status(conn, total_matches, total_odds)

    # Query helpers for API
    def list_matches(self, *, date: Optional[str] = None, league: Optional[str] = None,
                     page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        offset = (page - 1) * page_size
        where = []
        params: List[Any] = []
        if date:
            where.append("match_date = ?")
            params.append(date)
        if league:
            where.append("league_name = ?")
            params.append(league)
        where_clause = f"WHERE {' AND '.join(where)}" if where else ""
        base_sql = f"SELECT * FROM matches {where_clause} ORDER BY match_timestamp LIMIT ? OFFSET ?"
        with get_db() as conn:
            cur = conn.execute(base_sql, (*params, page_size, offset))
            rows = [dict(row) for row in cur.fetchall()]
            count_sql = f"SELECT COUNT(*) FROM matches {where_clause}"
            cur = conn.execute(count_sql, params)
            total = cur.fetchone()[0]
        match_ids = [row["match_id"] for row in rows]
        odds_map = self.fetch_wdl_for_matches(match_ids)
        for row in rows:
            row["wdl_odds"] = odds_map.get(row["match_id"], {})
        return {"items": rows, "total": total}

    def get_match(self, match_id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cur = conn.execute("SELECT * FROM matches WHERE match_id = ?", (match_id,))
            row = cur.fetchone()
            return dict(row) if row else None

    def get_wdl_odds(self, match_id: str) -> Dict[str, Dict[str, Any]]:
        with get_db() as conn:
            cur = conn.execute("SELECT * FROM odds_win_draw_lose WHERE match_id = ?", (match_id,))
            return {row["odds_type"]: dict(row) for row in cur.fetchall()}

    def fetch_wdl_for_matches(self, match_ids: List[str]) -> Dict[str, Dict[str, Dict[str, Any]]]:
        if not match_ids:
            return {}
        placeholders = ",".join(["?"] * len(match_ids))
        sql = f"SELECT * FROM odds_win_draw_lose WHERE match_id IN ({placeholders})"
        with get_db() as conn:
            cur = conn.execute(sql, match_ids)
            result: Dict[str, Dict[str, Dict[str, Any]]] = {}
            for row in cur.fetchall():
                match_id = row["match_id"]
                result.setdefault(match_id, {})[row["odds_type"]] = dict(row)
            return result

    def get_scores(self, match_id: str) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cur = conn.execute(
                "SELECT result_type, home_score, away_score, score_label, odds, is_other FROM odds_correct_score WHERE match_id = ?",
                (match_id,),
            )
            return [dict(row) for row in cur.fetchall()]

    def get_total_goals(self, match_id: str) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cur = conn.execute(
                "SELECT goal_range, min_goals, max_goals, odds FROM odds_total_goals WHERE match_id = ?",
                (match_id,),
            )
            return [dict(row) for row in cur.fetchall()]

    def get_hafu(self, match_id: str) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cur = conn.execute(
                "SELECT half_result, full_result, result_label, odds FROM odds_half_full_time WHERE match_id = ?",
                (match_id,),
            )
            return [dict(row) for row in cur.fetchall()]
