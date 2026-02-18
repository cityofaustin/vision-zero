#!/usr/bin/env python3
"""
Find the most recent migration that defines a given view or materialized view.

Used by export_database_views.sh to determine which migration file to cite in the
generated view SQL (e.g. for "Most recent migration: ..." headers). Unlike a
simple line-based grep, this script matches CREATE VIEW statements that may be
split across multiple lines (e.g. "CREATE" on one line and "OR REPLACE VIEW ..."
on the next), which is a pattern used in the migrations.

Usage:
    find_view_migration.py <view|materialized> <view_name>

Arguments:
    view_type   Either "view" or "materialized". Determines which regex pattern
                we use (CREATE VIEW vs CREATE MATERIALIZED VIEW ...).
    view_name   The PostgreSQL view/matview name (e.g. fatalities_view). Must
                match the identifier as it appears in the migration (with or
                without schema prefix or double quotes).

Output:
    On success: one line with the path to the migration up.sql file, relative
    to the repo root (e.g. database/migrations/default/1767430748998_foo/up.sql).
    On failure (no match or bad args): nothing to stdout, message to stderr
    if applicable, and non-zero exit code.
"""

import re
import sys
from pathlib import Path


def main() -> None:
    # --- Argument validation ---
    if len(sys.argv) != 3:
        sys.stderr.write("Usage: find_view_migration.py <view|materialized> <view_name>\n")
        sys.exit(2)
    view_type, view_name = sys.argv[1], sys.argv[2]
    if view_type not in ("view", "materialized"):
        sys.stderr.write("view_type must be 'view' or 'materialized'\n")
        sys.exit(2)

    # --- Resolve migrations directory ---
    # Script lives at .github/workflows/find_view_migration.py, so go up two
    # levels to get repo root, then into database/migrations/default as 
    # specified by `graphql-engine's migration system`.
    repo_root = Path(__file__).resolve().parent.parent.parent
    migrations_dir = repo_root / "database" / "migrations" / "default"
    if not migrations_dir.is_dir():
        sys.exit(1)

    # --- Build regex that matches CREATE VIEW / CREATE MATERIALIZED VIEW ---
    # We use \s+ (not just a space) so that newlines and other whitespace
    # between keywords are allowed. That way both of these match:
    #   CREATE OR REPLACE VIEW "public"."fatalities_view" AS ...
    #   CREATE
    #   OR REPLACE VIEW "public"."fatalities_view" AS ...
    # The view name is escaped so special regex chars in view names are safe.
    # Optional parts: (OR REPLACE), schema ("public". or public.), and quotes.
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

    # --- Scan all up.sql files and collect matches with their version ---
    # Migration directories are named like 1767430748998_crash_address_display_trigger.
    # The numeric prefix / timestamp is the data we use to pick "most recent".
    matches: list[tuple[int, Path]] = []
    for up_sql in sorted(migrations_dir.glob("*/up.sql")):
        text = up_sql.read_text()
        if pattern.search(text):
            version_str = up_sql.parent.name.split("_", 1)[0]
            try:
                version = int(version_str)
            except ValueError:
                version = 0
            matches.append((version, up_sql))

    if not matches:
        sys.exit(1)

    # --- Emit the path of the latest migration that defines this view ---
    matches.sort(key=lambda x: x[0])
    print(matches[-1][1].relative_to(repo_root), end="")


if __name__ == "__main__":
    main()
