#!/bin/bash

if [[ $DATABASE_CONNECTION =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
  USERNAME=${BASH_REMATCH[1]}
  PASSWORD=${BASH_REMATCH[2]}
  HOST=${BASH_REMATCH[3]}
  PORT=${BASH_REMATCH[4]}
  DATABASE=${BASH_REMATCH[5]}
else
  echo "Invalid DATABASE_CONNECTION format"
  exit 1
fi

# Path to the backup file
BACKUP_FILE="${DATABASE}_backup.backup"

# Drop the existing database and create a new one
PGPASSWORD=$PASSWORD psql -U $USERNAME -h $HOST -p $PORT -c "DROP DATABASE IF EXISTS $DATABASE WITH (FORCE);" postgres
PGPASSWORD=$PASSWORD psql -U $USERNAME -h $HOST -p $PORT -c "CREATE DATABASE $DATABASE;" postgres

# Restore the schema first, excluding the 'SET search_path' command
PGPASSWORD=$PASSWORD pg_restore -U $USERNAME -h $HOST -p $PORT -d $DATABASE --schema-only -v $BACKUP_FILE | sed '/SELECT pg_catalog.set_config('\'search_path\'', '\'''', false);/d' | PGPASSWORD=$PASSWORD psql -U $USERNAME -h $HOST -p $PORT -d $DATABASE

# Restore the data
PGPASSWORD=$PASSWORD pg_restore -U $USERNAME -h $HOST -p $PORT -d $DATABASE --data-only -v $BACKUP_FILE