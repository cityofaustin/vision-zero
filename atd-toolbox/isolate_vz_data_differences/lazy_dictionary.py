from functools import lru_cache
import psycopg2
import time


class LazyDictionary:
    def __init__(
        self,
        db_connection_string,
        data_model="new",
        table="crashes_cris",
        cache_size=100,
    ):
        self.data_model = data_model
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
                if len(key) == 3:
                    sql = "select * from people_cris where cris_crash_id = %s and unit_nbr = %s and prsn_nbr = %s"
                elif len(key) == 2:
                    sql = "select * from units_cris where cris_crash_id = %s and unit_nbr = %s"
                elif len(key) == 1:
                    sql = "select * from crashes_cris where crash_id = %s"
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

    def _exists_in_db(self, key):

        if isinstance(key, tuple):
            if len(key) == 3:
                sql = "select 1 from people_cris where cris_crash_id = %s and unit_nbr = %s and prsn_nbr = %s"
            elif len(key) == 2:
                sql = "select 1 from units_cris where cris_crash_id = %s and unit_nbr = %s"
            elif len(key) == 1:
                sql = "select 1 from crashes_cris where crash_id = %s"
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
