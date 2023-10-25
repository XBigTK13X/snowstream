import database.db_models as dm
from database.sql_alchemy import DbSession
import api_models as am


def create_shelf(shelf: am.Shelf):
    with DbSession() as db:
        dbm = dm.Shelf(**shelf.dict())
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_shelf_list():
    with DbSession() as db:
        return db.query(dm.Shelf).all()


def get_shelf_by_id(shelf_id: str):
    with DbSession() as db:
        return db.query(dm.Shelf).filter(dm.Shelf.id == shelf_id).first()
