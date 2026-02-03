"""
Import markdown files into the Claude Memory MCP SQLite database.

Usage:
    python import_to_memory.py <folder_path>

Each .md file becomes a memory entry. The filename becomes the title,
and the file content becomes the memory content.
"""

import json
import re
import sqlite3
import sys
import os
import uuid
from datetime import datetime, timezone
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


def get_db(db_path: Path) -> sqlite3.Connection:
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        print("Run the memory MCP server at least once first to initialize the DB.")
        sys.exit(1)
    return sqlite3.connect(str(db_path))


def generate_summary(content: str) -> str:
    """Generate a 15-25 word summary matching MCP's format."""
    text = content.strip()
    # Skip YAML frontmatter
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            text = parts[2].strip()
    # Strip markdown headers
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)

    # Try first sentence
    match = re.match(r'^[^.!?\n]+[.!?]', text)
    if match:
        s = match.group(0).strip()
        words = s.split()
        if 3 <= len(words) <= 25:
            return s

    # First 20 words
    words = text.split()[:20]
    if words:
        return " ".join(words) + "..."
    return text[:100]


def import_file(conn: sqlite3.Connection, filepath: Path) -> bool:
    """Import a single markdown file as a memory entry."""
    content = filepath.read_text(encoding="utf-8", errors="replace").strip()
    if not content:
        return False

    summary = generate_summary(content)
    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    memory_id = f"mem_{uuid.uuid4().hex[:24]}"

    try:
        conn.execute(
            "INSERT INTO memories (id, content, type, importance, created_at, "
            "last_accessed, is_deleted, summary, access_count, metadata) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (memory_id, content, "fact", 0.7, now_ms, now_ms, 0, summary, 0,
             json.dumps({"source": "markdown-import", "filename": filepath.name}))
        )
        # Also populate FTS index
        conn.execute(
            "INSERT INTO memories_fts (memory_id, content, summary) VALUES (?, ?, ?)",
            (memory_id, content, summary)
        )
        return True
    except sqlite3.Error as e:
        print(f"  Error importing {filepath.name}: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python import_to_memory.py <folder_path>")
        sys.exit(1)

    folder = Path(sys.argv[1])
    if not folder.is_dir():
        print(f"Not a directory: {folder}")
        sys.exit(1)

    md_files = sorted(folder.glob("*.md"))
    if not md_files:
        print(f"No .md files found in {folder}")
        sys.exit(1)

    print(f"Database: {DB_PATH}")
    conn = get_db(DB_PATH)

    print(f"Found {len(md_files)} markdown files to import.")
    imported = 0
    skipped = 0

    for f in md_files:
        if import_file(conn, f):
            imported += 1
            print(f"  + {f.name}")
        else:
            skipped += 1
            print(f"  - {f.name} (empty, skipped)")

    conn.commit()
    conn.close()

    print(f"\nDone: {imported} imported, {skipped} skipped.")


if __name__ == "__main__":
    main()
