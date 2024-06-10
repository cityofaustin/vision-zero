from functools import lru_cache
import psycopg2
import time


class LazyDictionary:
    def __init__(
        self,
        db_connection_string,
        table="crashes_cris",
        cache_size=100,
    ):
        self.table = table
        self.db_connection = psycopg2.connect(db_connection_string)
        self._fetch_from_db = self._lru_cache_fetch_from_db(cache_size)

    def __getitem__(self, key):
        return self._fetch_from_db(key)

    def __setitem__(self, key, value):
        self._store_in_db(key, value)
        self._fetch_from_db.cache_clear()

    def __contains__(self, key):
        return self._exists_in_db(key)

    def _lru_cache_fetch_from_db(self, cache_size):
        @lru_cache(maxsize=cache_size)
        def fetch_from_db(key):
            # Check if the key is a tuple and print its length
            if isinstance(key, tuple):
                if self.table == "crashes_cris":
                    sql = "select * from crashes_cris where crash_id = %s"
                elif self.table == "units_cris":
                    sql = "select * from units_cris where cris_crash_id = %s and unit_nbr = %s"
                elif self.table == "people_cris":
                    sql = "select * from people_cris where cris_crash_id = %s and unit_nbr = %s and prsn_nbr = %s"
                elif self.table == "atd_txdot_crashes":
                    sql = "select * from atd_txdot_crashes where crash_id = %s"
                elif self.table == "atd_txdot_units":
                    sql = "select * from atd_txdot_units where crash_id = %s and unit_nbr = %s"
                elif self.table == "atd_txdot_primaryperson":
                    sql = "select * from atd_txdot_primaryperson where crash_id = %s and unit_nbr = %s and prsn_nbr = %s"
                elif self.table == "atd_txdot_person":
                    sql = "select * from atd_txdot_person where crash_id = %s and unit_nbr = %s and prsn_nbr = %s"
                else:
                    return None

                with self.db_connection.cursor(
                    cursor_factory=psycopg2.extras.DictCursor
                ) as cur:
                    cur.execute(sql, key)
                    record = cur.fetchone()
                    return record
            else:
                raise TypeError("Key is not a tuple")

        return fetch_from_db

    def __iter__(self):
        with self.db_connection.cursor(
            cursor_factory=psycopg2.extras.DictCursor
        ) as cur:
            cur.execute(f"SELECT * FROM {self.table}")
            while True:
                record = cur.fetchone()
                if record is None:
                    break
                yield record

    def items(self):
        with self.db_connection.cursor(
            cursor_factory=psycopg2.extras.DictCursor
        ) as cur:
            cur.execute(f"SELECT * FROM {self.table}")
            for record in cur:
                if self.table == "crashes_cris":
                    key = (record["crash_id"],)
                elif self.table in ["units_cris", "atd_txdot_units"]:
                    key = (record["cris_crash_id"], record["unit_nbr"])
                elif self.table in [
                    "people_cris",
                    "atd_txdot_primaryperson",
                    "atd_txdot_person",
                ]:
                    key = (
                        record["cris_crash_id"],
                        record["unit_nbr"],
                        record["prsn_nbr"],
                    )
                elif self.table == "atd_txdot_crashes":
                    key = (record["crash_id"],)
                else:
                    continue
                yield key, dict(record)

    def _exists_in_db(self, key):

        if isinstance(key, tuple):
            if self.table == "crashes_cris":
                sql = "select * from crashes_cris where crash_id = %s"
            elif self.table == "units_cris":
                sql = "select * from units_cris where cris_crash_id = %s and unit_nbr = %s"
            elif self.table == "people_cris":
                sql = "select * from people_cris where cris_crash_id = %s and unit_nbr = %s and prsn_nbr = %s"
            elif self.table == "atd_txdot_crashes":
                sql = "select * from atd_txdot_crashes where crash_id = %s"
            elif self.table == "atd_txdot_units":
                sql = "select * from atd_txdot_units where crash_id = %s and unit_nbr = %s"
            elif self.table == "atd_txdot_primaryperson":
                sql = "select * from atd_txdot_primaryperson where crash_id = %s and unit_nbr = %s and prsn_nbr = %s"
            elif self.table == "atd_txdot_person":
                sql = "select * from atd_txdot_person where crash_id = %s and unit_nbr = %s and prsn_nbr = %s"
            else:
                return None

            with self.db_connection.cursor(
                cursor_factory=psycopg2.extras.DictCursor
            ) as cur:
                cur.execute(sql, key)
                record = cur.fetchone()
                return record
        else:
            raise TypeError("Key is not a tuple")

    def _store_in_db(self, key, value):
        # we don't want any of this
        return None
