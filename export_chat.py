"""
Export a Claude Code JSONL conversation to readable markdown.

Usage:
    python export_chat.py <jsonl_file> [output_file]
    python export_chat.py conversation.jsonl
    python export_chat.py conversation.jsonl chat_export.md
"""

import json
import sys
from pathlib import Path
from datetime import datetime


def export_chat(input_path: Path, output_path: Path):
    messages = []
    with open(input_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                messages.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    lines = []
    lines.append(f"# Claude Code Chat Export")
    lines.append(f"**Exported:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"**Source:** `{input_path.name}`")
    lines.append(f"**Messages:** {len(messages)}")
    lines.append("")
    lines.append("---")
    lines.append("")

    for msg in messages:
        role = msg.get("type", msg.get("role", "unknown"))

        # Skip non-conversation types
        if role in ("queue-operation", "file-history-snapshot", "summary"):
            continue

        content = msg.get("message", msg.get("content", ""))

        # Drill into nested message objects
        if isinstance(content, dict):
            content = content.get("content", "")

        # Handle content that's a list (tool calls, etc.)
        if isinstance(content, list):
            parts = []
            for block in content:
                if isinstance(block, dict):
                    if block.get("type") == "text":
                        parts.append(block.get("text", ""))
                    elif block.get("type") == "tool_use":
                        tool = block.get("name", "unknown")
                        inp = block.get("input", {})
                        if tool == "Read":
                            parts.append(f"*[Read: {inp.get('file_path', '?')}]*")
                        elif tool == "Write":
                            parts.append(f"*[Write: {inp.get('file_path', '?')}]*")
                        elif tool == "Edit":
                            parts.append(f"*[Edit: {inp.get('file_path', '?')}]*")
                        elif tool == "Bash":
                            cmd = inp.get("command", "?")
                            if len(cmd) > 100:
                                cmd = cmd[:100] + "..."
                            parts.append(f"*[Bash: `{cmd}`]*")
                        elif tool == "WebSearch":
                            parts.append(f"*[Search: {inp.get('query', '?')}]*")
                        elif tool == "WebFetch":
                            parts.append(f"*[Fetch: {inp.get('url', '?')}]*")
                        else:
                            parts.append(f"*[Tool: {tool}]*")
                    elif block.get("type") == "tool_result":
                        pass
                elif isinstance(block, str):
                    parts.append(block)
            content = "\n\n".join(p for p in parts if p)
        elif not isinstance(content, str):
            content = str(content) if content else ""

        if not content.strip():
            continue

        if role == "user":
            lines.append("## User")
        elif role == "assistant":
            lines.append("## Claude")
        else:
            lines.append(f"## {role.title()}")

        lines.append("")
        lines.append(content.strip())
        lines.append("")
        lines.append("---")
        lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Exported {len(messages)} messages to {output_path}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    input_path = Path(sys.argv[1])
    if not input_path.exists():
        print(f"File not found: {input_path}")
        sys.exit(1)

    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
    else:
        output_path = input_path.with_suffix(".md")

    export_chat(input_path, output_path)


if __name__ == "__main__":
    main()
