"""Persist the shared discussion board on the Streamlit server."""

from contextlib import closing, contextmanager
import logging
import os
from pathlib import Path
import re
import sqlite3
import time
import unicodedata

import psycopg
from psycopg.rows import dict_row

DB_PATH = Path(os.environ.get(
    "BTG_FORUM_DB", Path(__file__).resolve().parent / "data" / "forum.sqlite3"
))
SPORTS = {
    "tchoukball", "kin-ball", "korfball", "stacking", "footbag", "kendama",
    "roundnet", "floorball", "ultimate", "disc-golf", "skipping", "boccia",
}
TEAM = "Beyond the Game 網站團隊"
STARTERS = (
    ("tchoukball", "巧固球入門：點樣預判反彈球？",
     "兩人可以輪流向反彈網輕推，接球的人先企定觀察落點，再試行一步接球。如果只有五分鐘，你會先練判斷方向，定係先練接球手勢？"),
    ("stacking", "練疊杯 3-3-3，邊一步最易卡住？",
     "初學可以先關掉計時器，試連續三次把三組杯疊好，再按同一順序收杯。你最常在哪一步碰跌杯？有甚麼手勢可以幫到新手？"),
    ("kendama", "劍玉接大杯，點樣令球升得穩？",
     "開始時可以讓球垂直停穩，微微屈膝，再用伸膝帶起球。你會叫初學者先留意拉起的高度，還是杯接球時跟住球向下移？"),
    ("roundnet", "四個新手玩圓網球，點先打到來回？",
     "可以先做合作挑戰，兩人一組接球再輕拍向網，全組數一數連續成功幾多次。你覺得先容許接住球，還是放慢發球，會較容易讓大家一齊參與？"),
    ("ultimate", "極限飛盤初體驗：先練短傳定走位？",
     "三人站成三角形，用短距離反手傳盤，每接一次便換到下一個空位。如果同學未掌握傳盤，你會縮短距離，還是先讓大家企定練幾輪？"),
    ("boccia", "硬地滾球：第一球應該停喺邊？",
     "試在地上放一個白色目標球，輪流用軟球練習力度。你會先嘗試將球停在白球旁邊，還是放在對手容易瞄準的路線上？歡迎分享試過的擺位。"),
)

SCHEMA = """
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY, author TEXT NOT NULL, title TEXT NOT NULL,
    body TEXT NOT NULL, sport TEXT NOT NULL, created BIGINT NOT NULL,
    starter INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS replies (
    id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id),
    author TEXT NOT NULL, body TEXT NOT NULL, created BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS likes (
    post_id TEXT NOT NULL REFERENCES posts(id), visitor TEXT NOT NULL,
    PRIMARY KEY (post_id, visitor)
);
"""


def token(value):
    return isinstance(value, str) and re.fullmatch(r"[0-9a-f]{32}", value)


def field(request, name, minimum, maximum):
    value = request.get(name)
    if isinstance(value, str):
        value = value.strip()
        if minimum <= len(value) <= maximum and "\0" not in value:
            try:
                value.encode("utf-8")
                return value
            except UnicodeEncodeError:
                pass
    raise ValueError("請檢查必填欄位及字數。")


def author_name(request):
    author = field(request, "author", 1, 30)
    if unicodedata.normalize("NFKC", author).casefold() == TEAM.casefold():
        raise ValueError("請選用自己的暱稱。")
    return author


def update(db, request, visitor, request_id):
    action = request.get("action")
    created = time.time_ns() // 1_000_000
    if action == "list":
        return None
    if action == "post":
        sport = request.get("sport")
        if not isinstance(sport, str) or sport not in SPORTS:
            raise ValueError("請選擇有效的運動類別。")
        execute(db,
            """INSERT INTO posts (id, author, title, body, sport, created)
            VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING""",
            (request_id, author_name(request), field(request, "title", 5, 90),
             field(request, "body", 10, 1200), sport, created),
        )
        return request_id
    if action not in ("reply", "like"):
        raise ValueError("未能處理這個討論區操作。")
    post_id = request.get("post")
    if not isinstance(post_id, str) or not execute(db,
        "SELECT 1 FROM posts WHERE id = ?", (post_id,)
    ).fetchone():
        raise ValueError("找不到這篇討論。")
    if action == "reply":
        execute(db,
            """INSERT INTO replies (id, post_id, author, body, created)
            VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING""",
            (request_id, post_id, author_name(request), field(request, "body", 5, 800), created),
        )
    elif request.get("liked") is True:
        execute(db, "INSERT INTO likes VALUES (?, ?) ON CONFLICT (post_id, visitor) DO NOTHING", (post_id, visitor))
    elif request.get("liked") is False:
        execute(db, "DELETE FROM likes WHERE post_id = ? AND visitor = ?", (post_id, visitor))
    else:
        raise ValueError("未能處理支持操作。")
    return post_id


def load_posts(db, visitor):
    posts = {
        row["id"]: {**row, "replies": []}
        for row in execute(db, """
            SELECT posts.*, COALESCE(votes.total, 0) AS likes,
                   EXISTS(SELECT 1 FROM likes WHERE post_id = posts.id AND visitor = ?) AS liked
            FROM posts
            LEFT JOIN (SELECT post_id, COUNT(*) AS total FROM likes GROUP BY post_id) votes
            ON votes.post_id = posts.id
            ORDER BY posts.created DESC, posts.id
        """, (visitor,))
    }
    for row in execute(db, "SELECT * FROM replies ORDER BY created, id"):
        post = posts.get(row["post_id"])
        if post is not None:
            post["replies"].append(dict(row))
    return list(posts.values())


def execute(db, sql, params=()):
    # The queries are shared; only the drivers' parameter markers differ.
    if isinstance(db, psycopg.Connection):
        sql = sql.replace("?", "%s")
    return db.execute(sql, params)


def seed(db):
    if execute(db, "SELECT 1 FROM posts WHERE id = 'starter-1'").fetchone():
        return
    for number, (sport, title, body) in enumerate(STARTERS, 1):
        execute(db, """INSERT INTO posts (id, author, title, body, sport, created, starter)
                VALUES (?, ?, ?, ?, ?, 0, 1) ON CONFLICT (id) DO NOTHING""",
                (f"starter-{number}", TEAM, title, body, sport))


@contextmanager
def forum_connection(database_url, action):
    if database_url:
        with psycopg.connect(database_url, row_factory=dict_row, connect_timeout=8,
                             prepare_threshold=None) as db:
            # PostgreSQL DDL needs serialization when two visitors open an empty board.
            if db.execute("SELECT to_regclass('posts') AS table_name").fetchone()["table_name"] is None:
                db.execute("SELECT pg_advisory_xact_lock(1749264431)")
                for statement in SCHEMA.split(";"):
                    if statement.strip():
                        db.execute(statement)
                seed(db)
                db.commit()
            yield db
        return

    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(DB_PATH, timeout=8)) as db:
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        db.executescript(SCHEMA)
        with db:
            seed(db)
        with db:
            db.execute("BEGIN" if action == "list" else "BEGIN IMMEDIATE")
            yield db


def respond(request, database_url=None):
    if not isinstance(request, dict) or not token(request.get("id")):
        return None
    request_id = request["id"]
    try:
        visitor = request.get("visitor")
        if not token(visitor):
            raise ValueError("未能確認瀏覽器，請重新載入頁面。")
        with forum_connection(database_url, request.get("action")) as db:
            post_id = update(db, request, visitor, request_id)
            posts = load_posts(db, visitor)
        return {"id": request_id, "post": post_id, "posts": posts}
    except ValueError as error:
        return {"id": request_id, "error": str(error)}
    except (OSError, sqlite3.Error, psycopg.Error) as error:
        logging.error("Unable to access the Beyond the Game forum (%s)", type(error).__name__)
        return {"id": request_id, "error": "暫時未能連線到討論區，請再試一次。"}
