"""
Batch convert all Claude Code session JSONL files and import them
into the memory MCP database with proper chunking and formatting.

Usage:
    python import_all_sessions.py                  # convert + import all
    python import_all_sessions.py --convert-only   # just convert to markdown
    python import_all_sessions.py --import-only    # just import existing chunks
    python import_all_sessions.py --rebuild-fts    # rebuild the FTS index only

Handles:
    - Chunking large sessions into ~4000 char pieces
    - Generating real summaries from content
    - Epoch millisecond timestamps (matching MCP schema)
    - FTS index population
    - Deduplication by metadata source filename
    - Skips agent-*.jsonl subagent logs
    - Skips sessions with < 5 messages
"""

import json
import sqlite3
import re
import sys
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

CLAUDE_PROJECTS = Path.home() / ".claude" / "projects"

CHUNK_SIZE = 4000  # chars per chunk — fits well in the MCP's 1000 token budget


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


SENSITIVE_PATTERNS = [
    (re.compile(r'sk-ant-api\S+'), '[REDACTED_API_KEY]'),
    (re.compile(r'sk-[a-zA-Z0-9]{20,}'), '[REDACTED_KEY]'),
    (re.compile(r'ghp_[a-zA-Z0-9]{36,}'), '[REDACTED_GITHUB_TOKEN]'),
    (re.compile(r'(?i)api[_-]?key\s*[:=]\s*["\']?[\w-]{20,}'), '[REDACTED_API_KEY]'),
    (re.compile(r'(?i)password\s*[:=]\s*["\'][^"\']{8,}["\']'), '[REDACTED_PASSWORD]'),
]


def scrub_sensitive(text: str) -> str:
    """Remove API keys, tokens, and other sensitive patterns from text."""
    for pattern, replacement in SENSITIVE_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def extract_text_from_message(msg: dict) -> str:
    """Extract readable text from a JSONL message."""
    # JSONL uses "type" for role at top level; nested "message" dict has "role" too
    role = msg.get("type", msg.get("role", "unknown"))

    # Skip non-conversation message types
    if role in ("queue-operation", "file-history-snapshot", "summary", "unknown"):
        return ""

    # The JSONL format has nested structures — "message" can be a dict with
    # model metadata (not text).  Prefer "content" from the nested message object.
    raw = msg.get("message", msg.get("content", ""))

    # If "message" is a nested object (e.g. {"model": ..., "content": [...]}),
    # drill into its "content" field instead of stringifying the whole dict.
    if isinstance(raw, dict):
        raw = raw.get("content", "")

    if isinstance(raw, list):
        parts = []
        for block in raw:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
                elif block.get("type") == "tool_use":
                    tool = block.get("name", "unknown")
                    inp = block.get("input", {})
                    if tool == "Read":
                        parts.append(f"[Read: {inp.get('file_path', '?')}]")
                    elif tool == "Write":
                        parts.append(f"[Write: {inp.get('file_path', '?')}]")
                    elif tool == "Edit":
                        parts.append(f"[Edit: {inp.get('file_path', '?')}]")
                    elif tool == "Bash":
                        cmd = inp.get("command", "?")[:80]
                        parts.append(f"[Bash: {cmd}]")
                    elif tool in ("WebSearch", "WebFetch"):
                        parts.append(f"[{tool}: {inp.get('query', inp.get('url', '?'))[:60]}]")
                    else:
                        parts.append(f"[{tool}]")
                # Skip tool_result blocks — they contain raw output / noise
                elif block.get("type") == "tool_result":
                    pass
            elif isinstance(block, str):
                parts.append(block)
        content = "\n".join(p for p in parts if p)
    elif isinstance(raw, str):
        content = raw
    else:
        content = ""

    text = scrub_sensitive(content.strip())
    if not text:
        return ""

    prefix = "User" if role == "user" else "Claude" if role == "assistant" else role.title()
    return f"**{prefix}:** {text}"


def extract_first_user_message(messages: list[dict]) -> str:
    """Get the first substantive user message as session topic."""
    for msg in messages:
        if msg.get("role") == "user" or msg.get("type") == "user":
            content = msg.get("message", msg.get("content", ""))
            if isinstance(content, dict):
                content = content.get("content", "")
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text = block.get("text", "").strip()
                        if len(text) > 10:
                            return text[:150]
            elif isinstance(content, str) and len(content.strip()) > 10:
                return content.strip()[:150]
    return ""


def derive_project_name(folder_name: str) -> str:
    """Convert folder name like c--Users-username-Development-foo to readable name."""
    name = folder_name
    # Strip drive letter and common path prefixes (platform-agnostic)
    name = re.sub(r'^[a-zA-Z]--Users-[^-]+-Development-', '', name)
    name = re.sub(r'^[a-zA-Z]--Users-[^-]+-', '', name)
    name = re.sub(r'^[a-zA-Z]--Users-[^-]+--claude-worktrees-', '', name)
    return name.replace("-", " ").replace("_", " ").strip() or "General"


def generate_summary(text: str) -> str:
    """Generate a 15-25 word summary from text content."""
    text = text.strip()
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            text = parts[2].strip()
    # Strip markdown formatting
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    # Strip tool call annotations
    text = re.sub(r'\[(?:Read|Write|Edit|Bash|WebSearch|WebFetch|Tool)[^\]]*\]', '', text)
    text = text.strip()

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


def generate_chunk_summary(chunk_parts: list[str], project_name: str, chunk_num: int) -> str:
    """Generate a descriptive summary for a chunk by extracting key topics."""
    # Collect user messages — they indicate what the chunk is about
    user_topics = []
    for part in chunk_parts:
        if part.startswith("**User:**"):
            msg = part[len("**User:**"):].strip()
            # Skip very short responses (confirmations, "yes", "ok", etc.)
            if len(msg) > 20:
                # Clean up tool annotations
                msg = re.sub(r'\[(?:Read|Write|Edit|Bash|WebSearch|WebFetch|Tool)[^\]]*\]', '', msg).strip()
                if msg:
                    user_topics.append(msg)

    if user_topics:
        # Use the first substantive user message as the topic
        topic = user_topics[0]
        # Truncate to ~20 words
        words = topic.split()[:20]
        topic_text = " ".join(words)
        if len(words) == 20:
            topic_text += "..."
    else:
        # Fall back to first part of chunk
        topic_text = generate_summary(chunk_parts[0])

    prefix = f"Session {project_name} pt{chunk_num}"
    return f"{prefix}: {topic_text}"[:200]


def is_topic_shift(part: str, prev_part: str) -> bool:
    """Detect if a user message represents a new topic/request."""
    if not part.startswith("**User:**"):
        return False
    msg = part[len("**User:**"):].strip()
    # Short confirmations aren't topic shifts
    if len(msg) < 30:
        return False
    # Questions and requests are likely new topics
    if any(msg.lower().startswith(w) for w in
           ["can you", "how do", "what", "where", "why", "help me", "i need",
            "i want", "please", "let's", "now ", "next ", "okay so",
            "hey ", "alright"]):
        return True
    # If it's long enough and follows a Claude message, likely a new topic
    if prev_part.startswith("**Claude:**") and len(msg) > 80:
        return True
    return False


def chunk_session(messages: list[dict], project: str, session_id: str) -> list[tuple[str, str]]:
    """Split session into topic-aware chunks. Returns list of (content, summary) tuples."""
    # Extract all text
    text_parts = []
    for msg in messages:
        text = extract_text_from_message(msg)
        if text:
            text_parts.append(text)

    if not text_parts:
        return []

    project_name = derive_project_name(project)
    full_text = "\n\n".join(text_parts)

    # If small enough, single chunk
    if len(full_text) <= CHUNK_SIZE:
        topic = extract_first_user_message(messages)
        summary = f"Session in {project_name}: {generate_summary(topic or full_text)}"
        return [(full_text, summary[:200])]

    # Topic-aware chunking: split at topic shifts or size limits
    chunks = []
    current_chunk = []
    current_size = 0
    chunk_num = 0

    for i, part in enumerate(text_parts):
        prev_part = text_parts[i - 1] if i > 0 else ""

        # Split if: topic shift AND chunk is big enough, OR size limit exceeded
        should_split = False
        if current_chunk:
            if current_size + len(part) > CHUNK_SIZE:
                should_split = True
            elif current_size > CHUNK_SIZE // 3 and is_topic_shift(part, prev_part):
                # Topic shift, but only split if chunk has enough content (~1300+ chars)
                should_split = True

        if should_split:
            chunk_num += 1
            chunk_text = "\n\n".join(current_chunk)
            chunk_summary = generate_chunk_summary(current_chunk, project_name, chunk_num)
            chunks.append((chunk_text, chunk_summary))
            current_chunk = [part]
            current_size = len(part)
        else:
            current_chunk.append(part)
            current_size += len(part)

    # Last chunk
    if current_chunk:
        chunk_num += 1
        chunk_text = "\n\n".join(current_chunk)
        chunk_summary = generate_chunk_summary(current_chunk, project_name, chunk_num)
        chunks.append((chunk_text, chunk_summary))

    return chunks


def get_existing_sources(conn: sqlite3.Connection) -> set[str]:
    """Get filenames already imported to avoid duplicates."""
    rows = conn.execute(
        "SELECT metadata FROM memories WHERE metadata LIKE '%claude-session%' AND is_deleted = 0"
    ).fetchall()
    sources = set()
    for row in rows:
        try:
            meta = json.loads(row[0])
            if "filename" in meta:
                sources.add(meta["filename"])
        except (json.JSONDecodeError, TypeError):
            pass
    return sources


def import_chunk(conn: sqlite3.Connection, content: str, summary: str,
                 source_file: str, chunk_idx: int) -> bool:
    """Import a single chunk into the memory DB with proper MCP-compatible format."""
    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    memory_id = f"mem_{uuid.uuid4().hex[:24]}"

    try:
        conn.execute(
            "INSERT INTO memories (id, content, type, importance, created_at, "
            "last_accessed, is_deleted, summary, access_count, metadata) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (memory_id, content, "fact", 0.5, now_ms, now_ms, 0, summary, 0,
             json.dumps({"source": "claude-session", "filename": source_file,
                         "chunk": chunk_idx}))
        )
        # Also insert into FTS
        conn.execute(
            "INSERT INTO memories_fts (memory_id, content, summary) VALUES (?, ?, ?)",
            (memory_id, content, summary)
        )
        return True
    except sqlite3.Error as e:
        print(f"  DB error: {e}")
        return False


def rebuild_fts(conn: sqlite3.Connection):
    """Rebuild the entire FTS index from scratch."""
    conn.execute("DELETE FROM memories_fts")
    conn.execute(
        "INSERT INTO memories_fts (memory_id, content, summary) "
        "SELECT id, content, summary FROM memories WHERE is_deleted = 0"
    )
    count = conn.execute("SELECT COUNT(*) FROM memories_fts").fetchone()[0]
    print(f"FTS index rebuilt: {count} entries")


def main():
    if "--rebuild-fts" in sys.argv:
        conn = sqlite3.connect(str(DB_PATH))
        rebuild_fts(conn)
        conn.commit()
        conn.close()
        return

    convert = "--import-only" not in sys.argv
    do_import = "--convert-only" not in sys.argv

    # Find all JSONL files, skip agent-* files
    jsonl_files = []
    for project_dir in sorted(CLAUDE_PROJECTS.iterdir()):
        if not project_dir.is_dir():
            continue
        for f in sorted(project_dir.glob("*.jsonl")):
            if f.stem.startswith("agent-"):
                continue
            jsonl_files.append(f)

    print(f"Found {len(jsonl_files)} session files (excluding agent logs)")

    if not do_import and not convert:
        return

    # Connect to DB
    if do_import:
        if not DB_PATH.exists():
            print(f"Database not found at {DB_PATH}. Run the MCP server once first.")
            sys.exit(1)
        conn = sqlite3.connect(str(DB_PATH))
        existing_sources = get_existing_sources(conn)
    else:
        conn = None
        existing_sources = set()

    total_imported = 0
    total_chunks = 0
    skipped = 0

    for jsonl_path in jsonl_files:
        project = jsonl_path.parent.name
        source_name = f"{project}_{jsonl_path.stem}"

        # Skip if already imported
        if any(source_name in s for s in existing_sources):
            skipped += 1
            continue

        # Read and parse
        messages = []
        with open(jsonl_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    messages.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

        if len(messages) < 5:
            skipped += 1
            continue

        # Chunk the session
        chunks = chunk_session(messages, project, jsonl_path.stem[:8])
        if not chunks:
            skipped += 1
            continue

        project_name = derive_project_name(project)
        print(f"\n  {project_name} ({len(messages)} msgs -> {len(chunks)} chunks)")

        if do_import and conn:
            for i, (content, summary) in enumerate(chunks):
                if import_chunk(conn, content, summary, source_name, i):
                    total_imported += 1
                    total_chunks += 1

    if conn:
        conn.commit()
        print(f"\nImported: {total_imported} chunks from sessions, Skipped: {skipped}")

        # Rebuild FTS to be safe
        rebuild_fts(conn)
        conn.commit()
        conn.close()

    print("Done.")


if __name__ == "__main__":
    main()
