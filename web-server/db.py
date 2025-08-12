import database.operation
import database.db_models

class DbWrapper:
    def __init__(self):
        self.op = database.operation
        self.Ticket = database.db_models.Ticket
        self.Stub = database.db_models.Stub


db = DbWrapper()
