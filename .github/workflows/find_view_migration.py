#!/usr/bin/env python3
"""
Find the most recent migration that defines a given view or materialized view.
Handles multiline CREATE VIEW patterns (e.g. CREATE\\nOR REPLACE VIEW).
Usage: find_view_migration.py <view|materialized> <view_name>
Output: path to the migration up.sql, or nothing if not found.
"""

import re
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 3:
        sys.stderr.write("Usage: find_view_migration.py <view|materialized> <view_name>\n")
        sys.exit(2)
    view_type, view_name = sys.argv[1], sys.argv[2]
    if view_type not in ("view", "materialized"):
        sys.stderr.write("view_type must be 'view' or 'materialized'\n")
        sys.exit(2)

    # Migrations dir relative to repo root (script lives in .github/workflows)
    repo_root = Path(__file__).resolve().parent.parent.parent
    migrations_dir = repo_root / "database" / "migrations" / "default"
    if not migrations_dir.is_dir():
        sys.exit(1)

    safe_name = re.escape(view_name)
    if view_type == "view":
        pattern = re.compile(
            r"CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+"
            r"(\"?public\"?\.)?\s*\"?" + safe_name + r"\"?",
            re.IGNORECASE,
        )
    else:
        pattern = re.compile(
            r"CREATE\s+(OR\s+REPLACE\s+)?MATERIALIZED\s+VIEW\s+(IF\s+NOT\s+EXISTS\s+)?"
            r"(\"?public\"?\.)?\s*\"?" + safe_name + r"\"?",
            re.IGNORECASE,
        )

    matches: list[tuple[int, Path]] = []
    for up_sql in sorted(migrations_dir.glob("*/up.sql")):
        text = up_sql.read_text()
        if pattern.search(text):
            # Version is the numeric prefix of the directory name
            version_str = up_sql.parent.name.split("_", 1)[0]
            try:
                version = int(version_str)
            except ValueError:
                version = 0
            matches.append((version, up_sql))

    if not matches:
        sys.exit(1)
    # Sort by version and take the latest
    matches.sort(key=lambda x: x[0])
    print(matches[-1][1].relative_to(repo_root), end="")


if __name__ == "__main__":
    main()
