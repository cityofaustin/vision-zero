#!/usr/bin/env python3
"""Run a timed SQL benchmark directly via Python/PostgreSQL."""

from __future__ import annotations

import argparse
import curses
import os
import sys
from datetime import datetime
from time import perf_counter
from dataclasses import dataclass
from pathlib import Path


@dataclass
class BenchmarkResult:
    execution_time_ms: float
    row_count: int


def run_benchmark(
    sql_text: str,
    *,
    host: str = "localhost",
    port: int = 5431,
    dbname: str = "vision_zero",
    user: str = "visionzero",
    password: str = "visionzero",
) -> BenchmarkResult:
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError(
            "psycopg is required for direct Python DB benchmarking. "
            "Install it with: pip install psycopg[binary]"
        ) from exc

    with psycopg.connect(
        host=host,
        port=port,
        dbname=dbname,
        user=user,
        password=password,
        autocommit=True,
    ) as conn:
        with conn.cursor() as cur:
            start = perf_counter()
            cur.execute(sql_text)
            rows = cur.fetchall()
            end = perf_counter()

    return BenchmarkResult(
        execution_time_ms=(end - start) * 1000.0,
        row_count=len(rows),
    )


def percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = (len(ordered) - 1) * p
    low = int(index)
    high = min(low + 1, len(ordered) - 1)
    if low == high:
        return ordered[low]
    fraction = index - low
    return ordered[low] * (1 - fraction) + ordered[high] * fraction


def add_line(stdscr: curses.window, y: int, text: str) -> None:
    height, width = stdscr.getmaxyx()
    if 0 <= y < height:
        stdscr.addnstr(y, 0, text, max(1, width - 1))


def run_loop_ui(args: argparse.Namespace, sql_text: str) -> None:
    interval_seconds = args.interval_seconds
    def _loop(stdscr: curses.window) -> None:
        curses.curs_set(0)
        stdscr.nodelay(True)
        stdscr.timeout(200)

        entries: list[str] = []
        timings_ms: list[float] = []
        failures = 0
        run_count = 0
        scroll_offset = 0
        follow_tail = True
        started = perf_counter()
        next_run_at = perf_counter()

        while True:
            now = perf_counter()
            if now >= next_run_at:
                run_count += 1
                timestamp = datetime.now().strftime("%H:%M:%S")
                try:
                    result = run_benchmark(
                        sql_text,
                        host=args.host,
                        port=args.port,
                        dbname=args.dbname,
                        user=args.user,
                        password=args.password,
                    )
                    timings_ms.append(result.execution_time_ms)
                    entries.append(
                        f"{run_count:05d} {timestamp}  {result.execution_time_ms:10.3f} ms  "
                        f"rows={result.row_count}"
                    )
                except Exception as exc:  # noqa: BLE001 - keep loop alive while benchmarking
                    failures += 1
                    entries.append(
                        f"{run_count:05d} {timestamp}  ERROR {exc.__class__.__name__}: {exc}"
                    )
                next_run_at = now + interval_seconds

            stdscr.erase()
            height, width = stdscr.getmaxyx()
            stats_height = 9
            history_top = 1
            history_height = max(3, height - stats_height - history_top)
            max_scroll = max(0, len(entries) - history_height)

            if follow_tail:
                scroll_offset = max_scroll
            else:
                scroll_offset = min(scroll_offset, max_scroll)

            add_line(
                stdscr,
                0,
                "DB Benchmark Loop  |  q quit  up/down scroll  PgUp/PgDn page  Home/End jump",
            )
            for row in range(history_height):
                entry_index = scroll_offset + row
                if entry_index >= len(entries):
                    break
                add_line(stdscr, history_top + row, entries[entry_index])

            divider_y = history_top + history_height
            add_line(stdscr, divider_y, "-" * max(1, width - 1))

            elapsed_seconds = max(0.0, perf_counter() - started)
            next_in = max(0.0, next_run_at - perf_counter())
            success_count = len(timings_ms)
            mean_ms = (sum(timings_ms) / success_count) if success_count else 0.0
            min_ms = min(timings_ms) if success_count else 0.0
            max_ms = max(timings_ms) if success_count else 0.0
            p50_ms = percentile(timings_ms, 0.50)
            p95_ms = percentile(timings_ms, 0.95)

            stats_lines = [
                f"Runs: {run_count}  Success: {success_count}  Failures: {failures}  Interval: {interval_seconds:.0f}s  Next: {next_in:.1f}s",
                f"Mean: {mean_ms:.3f} ms  Min: {min_ms:.3f} ms  Max: {max_ms:.3f} ms",
                f"P50: {p50_ms:.3f} ms  P95: {p95_ms:.3f} ms",
                f"Elapsed: {elapsed_seconds:.1f}s  Showing {scroll_offset + 1 if entries else 0}-{min(len(entries), scroll_offset + history_height)} of {len(entries)}",
            ]

            for i, line in enumerate(stats_lines, start=divider_y + 1):
                add_line(stdscr, i, line)

            stdscr.refresh()

            key = stdscr.getch()
            if key in (ord("q"), ord("Q")):
                break
            if key == curses.KEY_UP:
                follow_tail = False
                scroll_offset = max(0, scroll_offset - 1)
            elif key == curses.KEY_DOWN:
                scroll_offset = min(max_scroll, scroll_offset + 1)
                follow_tail = scroll_offset >= max_scroll
            elif key == curses.KEY_PPAGE:
                follow_tail = False
                scroll_offset = max(0, scroll_offset - history_height)
            elif key == curses.KEY_NPAGE:
                scroll_offset = min(max_scroll, scroll_offset + history_height)
                follow_tail = scroll_offset >= max_scroll
            elif key == curses.KEY_HOME:
                follow_tail = False
                scroll_offset = 0
            elif key == curses.KEY_END:
                follow_tail = True
                scroll_offset = max_scroll

    curses.wrapper(_loop)


def main() -> None:
    # This script is intended to run from `toolbox/db_benchmark/`.
    default_sql_file = Path("timing_query.sql")

    parser = argparse.ArgumentParser(
        description="Benchmark SQL execution time using a direct Python DB connection."
    )
    parser.add_argument(
        "--sql-file",
        type=Path,
        default=default_sql_file,
        help="Path to SQL file to run (default: timing_query.sql).",
    )
    parser.add_argument(
        "--host",
        default=os.getenv("PGHOST", "localhost"),
        help="PostgreSQL host (default: localhost or PGHOST).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PGPORT", "5431")),
        help="PostgreSQL port (default: 5431 or PGPORT).",
    )
    parser.add_argument(
        "--dbname",
        default=os.getenv("PGDATABASE", "vision_zero"),
        help="Database name (default: vision_zero or PGDATABASE).",
    )
    parser.add_argument(
        "--user",
        default=os.getenv("PGUSER", "visionzero"),
        help="Database user (default: visionzero or PGUSER).",
    )
    parser.add_argument(
        "--password",
        default=os.getenv("PGPASSWORD", "visionzero"),
        help="Database password (default: visionzero or PGPASSWORD).",
    )
    parser.add_argument(
        "--loop",
        action="store_true",
        help="Run continuously with an interactive terminal UI.",
    )
    parser.add_argument(
        "--interval-seconds",
        type=float,
        default=1.0,
        help="Delay between loop iterations in seconds (default: 1.0).",
    )
    args = parser.parse_args()

    if args.interval_seconds <= 0:
        print("--interval-seconds must be greater than 0.", file=sys.stderr)
        raise SystemExit(1)

    sql_text = args.sql_file.read_text()

    if args.loop:
        if not sys.stdout.isatty():
            print("--loop requires an interactive TTY terminal.", file=sys.stderr)
            raise SystemExit(1)
        run_loop_ui(args, sql_text)
        return

    try:
        result = run_benchmark(
            sql_text,
            host=args.host,
            port=args.port,
            dbname=args.dbname,
            user=args.user,
            password=args.password,
        )
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1) from exc

    print(f"Execution time: {result.execution_time_ms:.3f} ms")
    print(f"Rows returned: {result.row_count}")


if __name__ == "__main__":
    main()
