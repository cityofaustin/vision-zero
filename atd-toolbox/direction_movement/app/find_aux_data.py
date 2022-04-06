#!/usr/bin/python3

import pprint

import psycopg2
from psycopg2 import (
    extras,
)

# setup global objects
pp = pprint.PrettyPrinter(indent=2)

now = psycopg2.connect(
    host="localhost", database="current_vz", user="moped", password=""
)

def main():


if __name__ == "__main__":
    main()
