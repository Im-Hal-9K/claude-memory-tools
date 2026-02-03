# Claude Memory Tools

A forked and improved version of [@whenmoon-afk/memory-mcp](https://www.npmjs.com/package/@whenmoon-afk/memory-mcp) with better FTS5 search, plus Python utilities for importing data into the memory database.

## What's different from upstream

The upstream MCP passes search queries directly to SQLite FTS5 with no preprocessing. FTS5's default operator is AND, so a query like `"bonsai tree plant care"` requires **all four words** in a single memory — returning zero results even when relevant memories exist.

**This fork adds:**

- **OR expansion** — multi-word queries are split and joined with OR, so any matching term returns results
- **Prefix wildcards** — `UMass` matches `UMass Global`, `home` matches `homelab`
- **Quoted phrase passthrough** — `"exact phrase"` still does exact matching
- **Term-match boosting** — memories matching more of your query terms rank higher

| Query | Upstream | This fork |
|-------|----------|-----------|
| `bonsai tree plant care` | 0 results | 89 results |
| `plant care` | 2 results | 84 results |
| `book writing style` | 22 results | 287 results |

The existing porter stemming and hybrid scoring (importance/recency/frequency) are preserved.

## Setup

### MCP Server (the fork)

Install dependencies:

```bash
cd memory-mcp-fork
npm install --ignore-scripts
```

#### Claude Code (`~/.claude/.mcp.json`)

```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": ["/path/to/claude-memory-tools/memory-mcp-fork/dist/index.js"]
    }
  }
}
```

#### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": ["/path/to/claude-memory-tools/memory-mcp-fork/dist/index.js"]
    }
  }
}
```

### Python Tools

No dependencies beyond Python 3.10+ standard library.

## Tools

### `import_to_memory.py` — Import markdown files

Import a folder of `.md` files (e.g. Capacities/Obsidian/Notion exports) as memories:

```bash
python import_to_memory.py /path/to/markdown/folder
```

- Each file becomes one memory entry
- Generates summaries from content
- Populates FTS index
- Stores source filename in metadata for deduplication

### `import_all_sessions.py` — Import Claude Code sessions

Batch import all Claude Code JSONL session files as searchable memories:

```bash
python import_all_sessions.py                  # convert + import all
python import_all_sessions.py --rebuild-fts    # rebuild FTS index only
python import_all_sessions.py --convert-only   # dry run, no DB changes
python import_all_sessions.py --import-only    # import pre-converted chunks
```

- Chunks large sessions into ~4000 char pieces (fits MCP's token budget)
- Generates human-readable summaries
- Deduplicates by source filename
- Skips agent subprocesses and tiny sessions (< 5 messages)

### `memory_search.py` — CLI search

Search, list, and manage memories from the command line:

```bash
python memory_search.py bonsai              # search
python memory_search.py "plant care"        # phrase search
python memory_search.py --list              # list all
python memory_search.py --stats             # DB statistics
python memory_search.py --delete mem_abc    # soft-delete by ID prefix
```

### `export_chat.py` — Export conversations

Convert a Claude Code JSONL session to readable markdown:

```bash
python export_chat.py session.jsonl                    # outputs session.md
python export_chat.py session.jsonl my_export.md       # custom output path
```

## Database location

The MCP stores its SQLite database at:

| Platform | Path |
|----------|------|
| Windows | `%APPDATA%/claude-memories/memory.db` |
| macOS | `~/.claude-memories/memory.db` |
| Linux | `~/.local/share/claude-memories/memory.db` |

Override with the `MEMORY_DB_PATH` environment variable.

## License

The memory-mcp-fork is based on [@whenmoon-afk/memory-mcp](https://www.npmjs.com/package/@whenmoon-afk/memory-mcp) (MIT license). Python tools are MIT licensed.
