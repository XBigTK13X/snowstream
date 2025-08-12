from database.operation.db_internal import dbi
import api_models as am

def create_shelf(shelf: am.Shelf):
    with dbi.session() as db:
        dbm = dbi.dm.Shelf(**shelf.model_dump())
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
    with dbi.session() as db:
        existing_shelf = db.query(dbi.dm.Shelf).filter(dbi.dm.Shelf.id == shelf.id).update(shelf.model_dump())
        db.commit()
        return existing_shelf

def get_shelf_list(ticket:dbi.dm.Ticket=None):
    with dbi.session() as db:
        query = db.query(dbi.dm.Shelf)
        if ticket != None and ticket.shelf_ids != None:
            query = query.filter(dbi.dm.Shelf.id.in_(ticket.shelf_ids))
        return query.all()


def get_shelf_by_id(shelf_id: str):
    with dbi.session() as db:
        return db.query(dbi.dm.Shelf).filter(dbi.dm.Shelf.id == shelf_id).first()

def delete_shelf_by_id(shelf_id: str):
    with dbi.session() as db:
        deleted = db.query(dbi.dm.Shelf).filter(dbi.dm.Shelf.id == shelf_id).delete()
        db.commit()
        return deleted