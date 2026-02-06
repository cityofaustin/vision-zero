#!/usr/bin/env bash

USE_GITHUB_ACTION=false
for arg in "$@"; do
    if [[ "$arg" == "--github-action" ]]; then
        USE_GITHUB_ACTION=true
        break
    fi
done

export USE_GITHUB_ACTION

function run_psql() {
    if $USE_GITHUB_ACTION; then
        psql "$@"
    else
        docker compose exec postgis psql "$@"
    fi
}

function create_view_file() {
    local VIEW_NAME=$1

    echo "View: $VIEW_NAME"
    MOST_RECENT_MIGRATION=$(grep -rl --include=up.sql -E "CREATE (OR REPLACE )?VIEW (\"?public\"?.)?\"?$VIEW_NAME\"?" database/migrations/default | sort -V | tail -n 1)
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
    MOST_RECENT_MIGRATION=$(grep -rl --include=up.sql -E "CREATE (OR REPLACE )?MATERIALIZED VIEW( IF NOT EXISTS)? (\"?public\"?.)?\"?$VIEW_NAME\"?" database/migrations/default | sort -V | tail -n 1)
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
