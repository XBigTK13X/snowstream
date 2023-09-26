import database.sql_alchemy
import database.operation
import database.db_models
import sqlalchemy.orm as orm


class DbSql:
    def __init__(self, DbWrapper):
        self.db_wrapper = DbWrapper
        self.truncate = database.sql_alchemy.DbTruncate

    def bulk_insert(self, Model, items):
        with self.db_wrapper.Session() as con:
            con.bulk_insert_mappings(Model, items)
            con.commit()


class DbWrapper:
    def __init__(self):
        self.Session = database.sql_alchemy.DbSession
        self.op = database.operation
        self.model = database.db_models
        self.sql = DbSql(self)
        self.orm = orm


db = DbWrapper()
