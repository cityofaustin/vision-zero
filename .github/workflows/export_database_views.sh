#!/usr/bin/env bash

function create_view_file() {
    local VIEW_NAME=$1

    echo "View: $VIEW_NAME"
    MOST_RECENT_MIGRATION=$(grep -rl --include=up.sql -E "CREATE (OR REPLACE )?VIEW (\"?public\"?.)?\"?$VIEW_NAME\"?" moped-database/migrations/default | sort -V | tail -n 1)
    echo "MOST_RECENT_MIGRATION: $MOST_RECENT_MIGRATION"

    # Create the view file with header
    echo "-- Most recent migration: $MOST_RECENT_MIGRATION" > moped-database/views/$VIEW_NAME.sql
    echo "" >> moped-database/views/$VIEW_NAME.sql

    # Query the view definition and append to the file
    psql -A -t -c "SELECT 'CREATE OR REPLACE VIEW ' || '$VIEW_NAME' || ' AS ' || pg_get_viewdef('$VIEW_NAME'::regclass, true);" >> moped-database/views/$VIEW_NAME.sql
}

# Export the function
export -f create_view_file

function populate_views() {
    mkdir -p moped-database/views
    psql -A -t -c "SELECT table_name FROM information_schema.views WHERE table_schema = 'public';" | \
    grep -v -E '^geo[a-zA-Z]+y_columns$' | \
    xargs -I {} bash -c "create_view_file '{}'"
}

populate_views
