#!/usr/bin/env bash

USE_GITHUB_ACTION=false
for arg in "$@"; do
    if [[ "$arg" == "--github-action" ]]; then
        USE_GITHUB_ACTION=true
        break
    fi
done

export USE_GITHUB_ACTION

# Directory containing this script (and find_view_migration.py)
EXPORT_SCRIPT_DIR=$(cd -- "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
export EXPORT_SCRIPT_DIR

if ! $USE_GITHUB_ACTION; then
    SCRIPT_DIR=$(cd -- "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
    REPO_ROOT=$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)
    CURRENT_DIR=$(pwd -P)
    if [[ "$CURRENT_DIR" != "$REPO_ROOT" ]]; then
        echo "Error: This script must be run from the repo root when not in GitHub Action mode." >&2
        echo "  Repo root: $REPO_ROOT" >&2
        echo "  Current dir: $CURRENT_DIR" >&2
        exit 1
    fi
    # Load DB credentials for local psql (e.g. from .env)
    if [[ -f "$REPO_ROOT/.env" ]]; then
        set -a
        # shellcheck source=/dev/null
        source "$REPO_ROOT/.env"
        set +a
    fi
    # Defaults matching docker-compose-github-actions.yml if .env not present
    : "${POSTGRES_USER:=visionzero}"
    : "${POSTGRES_DB:=vision_zero}"
fi

function run_psql() {
    if $USE_GITHUB_ACTION; then
        psql "$@"
    else
        docker compose -f ./docker-compose-github-actions.yml exec postgis psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"
    fi
}

function create_view_file() {
    local VIEW_NAME=$1

    echo "View: $VIEW_NAME"
    MOST_RECENT_MIGRATION=$(python3 "$EXPORT_SCRIPT_DIR/find_view_migration.py" view "$VIEW_NAME" 2>/dev/null) || true
    echo "MOST_RECENT_MIGRATION: $MOST_RECENT_MIGRATION"

    # Create the view file with header
    echo "-- Most recent migration: $MOST_RECENT_MIGRATION" > database/views/$VIEW_NAME.sql
    echo "" >> database/views/$VIEW_NAME.sql

    # Query the view definition and append to the file
    run_psql -v ON_ERROR_STOP=1 -A -t -c "SELECT 'CREATE OR REPLACE VIEW ' || '$VIEW_NAME' || ' AS ' || pg_get_viewdef('$VIEW_NAME'::regclass, true);" >> database/views/$VIEW_NAME.sql
}

# Materialized views do not support CREATE OR REPLACE, so we emit
#   DROP MATERIALIZED VIEW IF EXISTS ...
#   CREATE MATERIALIZED VIEW ... AS ...
function create_materialized_view_file() {
    local VIEW_NAME=$1

    echo "Materialized view: $VIEW_NAME"
    MOST_RECENT_MIGRATION=$(python3 "$EXPORT_SCRIPT_DIR/find_view_migration.py" materialized "$VIEW_NAME" 2>/dev/null) || true
    echo "MOST_RECENT_MIGRATION: $MOST_RECENT_MIGRATION"

    mkdir -p database/views/materialized

    # Create the materialized view file with header
    echo "-- Most recent migration: $MOST_RECENT_MIGRATION" > database/views/materialized/$VIEW_NAME.sql
    echo "" >> database/views/materialized/$VIEW_NAME.sql
    echo "DROP MATERIALIZED VIEW IF EXISTS $VIEW_NAME;" >> database/views/materialized/$VIEW_NAME.sql
    echo "" >> database/views/materialized/$VIEW_NAME.sql

    # Query the materialized view definition and append to the file
    run_psql -v ON_ERROR_STOP=1 -A -t -c "SELECT 'CREATE MATERIALIZED VIEW ' || '$VIEW_NAME' || ' AS ' || pg_get_viewdef('$VIEW_NAME'::regclass, true);" >> database/views/materialized/$VIEW_NAME.sql
}

# Export the function
export -f run_psql
export -f create_view_file
export -f create_materialized_view_file

function populate_views() {
    mkdir -p database/views
    run_psql -v ON_ERROR_STOP=1 -A -t -c "SELECT table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name;" | \
    grep -v -E '^geo[a-zA-Z]+y_columns$' | \
    xargs -I {} bash -c "create_view_file '{}'"
}

function populate_materialized_views() {
    mkdir -p database/views/materialized
    run_psql -v ON_ERROR_STOP=1 -A -t -c "SELECT matviewname FROM pg_matviews WHERE schemaname = 'public' ORDER BY matviewname;" | \
    grep -v -E '^geo[a-zA-Z]+y_columns$' | \
    xargs -I {} bash -c "create_materialized_view_file '{}'"
}

populate_views
populate_materialized_views
