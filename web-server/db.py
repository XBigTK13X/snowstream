import database.sql_alchemy
import database.operation
import database.db_models


class DbSql:
    def __init__(self):
        self.truncate = database.sql_alchemy.DbTruncate

    def bulk_insert(self, Model, items):
        with self.Session() as con:
            con.bulk_insert_mappings(Model, items)


class DbWrapper:
    def __init__(self):
        self.Session = database.sql_alchemy.DbSession
        self.op = database.operation
        self.model = database.db_models
        self.sql = DbSql()


db = DbWrapper()
