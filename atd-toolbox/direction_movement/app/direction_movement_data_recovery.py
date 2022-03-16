#!/usr/bin/python3

import psycopg2

past = psycopg2.connect(
    host="localhost",
    database="past_vz",
    user="moped",
    password="")

now = psycopg2.connect(
    host="localhost",
    database="current_vz",
    user="moped",
    password="")