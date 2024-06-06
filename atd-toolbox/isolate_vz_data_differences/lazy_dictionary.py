from functools import lru_cache
import psycopg2
import time


class LazyDictionary:
    def __init__(self, db_connection, cache_size=100):
        self.db_connection = db_connection
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
            # Implement your database fetching logic here
            print(f"Fetching data for key: {key}")
            return time.time()
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT full_data FROM your_table WHERE key = %s", (key,))
            result = cursor.fetchone()
            return result[0] if result else None

        return fetch_from_db

    def _exists_in_db(self, key):
        pass
        # Implement your database existence check logic here
        # cursor = self.db_connection.cursor()
        # cursor.execute("SELECT 1 FROM your_table WHERE key = %s", (key,))
        # return cursor.fetchone() is not None

    def _store_in_db(self, key, value):
        # we don't want any of this
        return None
