#!/bin/bash
set -e

# Crée toutes les bases nécessaires
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE smartschool_db1;
    CREATE DATABASE smartschool_db2;
    CREATE DATABASE smartschool_db3;
    CREATE DATABASE smartschool_db4;
EOSQL
    