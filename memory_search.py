"""
Search the Claude Memory MCP database from the command line.

Usage:
    python memory_search.py <query>          # full-text search
    python memory_search.py --list           # list all memories
    python memory_search.py --stats          # show DB stats
    python memory_search.py --delete <id>    # soft-delete a memory

Examples:
    python memory_search.py accessibility
    python memory_search.py "course materials"
    python memory_search.py --list
"""

import sqlite3
import sys
import os
from pathlib import Path


def get_db_path() -> Path:
    """Get the memory database path, matching @whenmoon-afk/memory-mcp conventions."""
    if os.environ.get("MEMORY_DB_PATH"):
        return Path(os.environ["MEMORY_DB_PATH"])
    if sys.platform == "win32":
        return Path(os.environ.get("APPDATA", "")) / "claude-memories" / "memory.db"
    elif sys.platform == "darwin":
        return Path.home() / ".claude-memories" / "memory.db"
    else:
        return Path.home() / ".local" / "share" / "claude-memories" / "memory.db"


DB_PATH = get_db_path()


def get_db() -> sqlite3.Connection:
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        sys.exit(1)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def search(query: str):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id, summary, substr(content, 1, 300) as preview, created_at "
            "FROM memories WHERE is_deleted = 0 AND content LIKE ? "
            "ORDER BY created_at DESC",
            (f"%{query}%",)
        ).fetchall()
    except Exception:
        rows = []

    if not rows:
        print(f"No results for '{query}'")
        return

    print(f"Found {len(rows)} result(s) for '{query}':\n")
    for i, row in enumerate(rows, 1):
        preview = row["preview"].replace("\n", " ").strip()
        print(f"  {i}. [{row['summary']}]")
        print(f"     ID: {row['id'][:8]}...")
        print(f"     Preview: {preview[:200]}...")
        print()
    conn.close()


def list_all():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, summary, type, importance, created_at "
        "FROM memories WHERE is_deleted = 0 ORDER BY created_at DESC"
    ).fetchall()

    if not rows:
        print("No memories stored.")
        return

    print(f"Total: {len(rows)} memories\n")
    for i, row in enumerate(rows, 1):
        print(f"  {i:3}. {row['summary']}")
        print(f"       Type: {row['type']} | Importance: {row['importance']}")
        print(f"       ID: {row['id'][:8]}...")
    conn.close()


def stats():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM memories WHERE is_deleted = 0").fetchone()[0]
    deleted = conn.execute("SELECT COUNT(*) FROM memories WHERE is_deleted = 1").fetchone()[0]
    types = conn.execute(
        "SELECT type, COUNT(*) as c FROM memories WHERE is_deleted = 0 GROUP BY type"
    ).fetchall()
    size = DB_PATH.stat().st_size

    print(f"Database: {DB_PATH}")
    print(f"Size: {size / 1024:.1f} KB")
    print(f"Active memories: {total}")
    print(f"Deleted memories: {deleted}")
    print(f"Types:")
    for t in types:
        print(f"  {t['type']}: {t['c']}")
    conn.close()


def soft_delete(memory_id: str):
    conn = get_db()
    row = conn.execute(
        "SELECT id, summary FROM memories WHERE id LIKE ? AND is_deleted = 0",
        (f"{memory_id}%",)
    ).fetchone()
    if not row:
        print(f"No active memory found starting with '{memory_id}'")
        conn.close()
        return
    conn.execute("UPDATE memories SET is_deleted = 1 WHERE id = ?", (row["id"],))
    conn.commit()
    print(f"Deleted: {row['summary']} ({row['id'][:8]}...)")
    conn.close()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    arg = sys.argv[1]
    if arg == "--list":
        list_all()
    elif arg == "--stats":
        stats()
    elif arg == "--delete" and len(sys.argv) >= 3:
        soft_delete(sys.argv[2])
    else:
        search(" ".join(sys.argv[1:]))


if __name__ == "__main__":
    main()
