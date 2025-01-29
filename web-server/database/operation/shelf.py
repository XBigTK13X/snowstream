import database.db_models as dm
from database.sql_alchemy import DbSession
import api_models as am


def create_shelf(shelf: am.Shelf):
    with DbSession() as db:
        dbm = dm.Shelf(**shelf.model_dump())
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def upsert_shelf(shelf: am.Shelf):
    existing_shelf = None
    if shelf.id:
        existing_shelf = get_shelf_by_id(shelf_id=shelf.id)
    if not existing_shelf:
        return create_shelf(shelf)    
    with DbSession() as db:
        existing_shelf = db.query(dm.Shelf).filter(dm.Shelf.id == shelf.id).update(shelf.model_dump())
        db.commit()        
        return existing_shelf

def get_shelf_list(restrictions:list[int] = None):
    with DbSession() as db:        
        query = db.query(dm.Shelf)
        if restrictions != None:
            import pprint
            pprint.pprint(restrictions)
            query = query.filter(dm.Shelf.id.in_(restrictions))
        return query.all()


def get_shelf_by_id(shelf_id: str):
    with DbSession() as db:
        return db.query(dm.Shelf).filter(dm.Shelf.id == shelf_id).first()

def delete_shelf_by_id(shelf_id: str):
    with DbSession() as db:
        deleted = db.query(dm.Shelf).filter(dm.Shelf.id == shelf_id).delete()
        db.commit()
        return deleted