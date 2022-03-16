#!/usr/bin/python3

import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="past_vz",
    user="moped",
    password="")