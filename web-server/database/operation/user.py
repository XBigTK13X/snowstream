from database.operation.db_internal import dbi
import api_models as am

def create_user(user: am.User):
    with dbi.session() as db:
        model_dump = user.model_dump()
        model_dump['has_password'] = model_dump['raw_password'] != 'SNOWSTREAM_EMPTY'
        model_dump['hashed_password'] = dbi.util.get_password_hash(model_dump['raw_password'])
        del model_dump['raw_password']
        del model_dump['id']
        del model_dump['cduid']
        del model_dump['ticket']
        del model_dump['set_password']
        dbm = dbi.dm.User(**model_dump)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def upsert_user(user: am.User):
    existing = None
    if user.id:
        existing = get_user_by_id(user.id)
    elif user.username:
        existing = get_user_by_name(user.username)
    if not existing:
        return create_user(user)
    with dbi.session() as db:
        model_dump = user.model_dump()
        if model_dump['set_password']:
            if user.raw_password != 'SNOWSTREAM_EMPTY' and user.raw_password != '':
                model_dump['hashed_password'] = dbi.util.get_password_hash(model_dump['raw_password'])
                model_dump['has_password'] = True
            else:
                model_dump['hashed_password'] = dbi.util.get_password_hash('SNOWSTREAM_EMPTY')
                model_dump['has_password'] = False
        else:
            model_dump['hashed_password'] = existing.hashed_password
            model_dump['has_password'] = existing.has_password

        del model_dump['raw_password']
        del model_dump['set_password']
        del model_dump['cduid']
        del model_dump['ticket']

        existing = db.query(dbi.dm.User).filter(dbi.dm.User.id == existing.id).update(model_dump)
        db.commit()
        return existing

def get_user_by_id(user_id:int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.User)
            .filter(dbi.dm.User.id == user_id)
            .options(dbi.orm.joinedload(dbi.dm.User.access_tags))
            .options(dbi.orm.joinedload(dbi.dm.User.access_shelves))
            .options(dbi.orm.joinedload(dbi.dm.User.access_stream_sources))
            .first()
        )

def get_user_by_name(username: str):
    with dbi.session() as db:
        query = db.query(dbi.dm.User)
        return query.filter(dbi.dm.User.username == username).first()


def get_user_list():
    with dbi.session() as db:
        return db.query(dbi.dm.User).order_by(dbi.dm.User.username).all()

def delete_user_by_id(user_id:int):
    with dbi.session() as db:
        deleted = db.query(dbi.dm.User).filter(dbi.dm.User.id == user_id).delete()
        db.commit()
        return deleted

def save_user_access(user_access:am.UserAccess):
    user_tags = []
    for tag_id in user_access.tag_ids:
        user_tag = dbi.dm.UserTag()
        user_tag.user_id = user_access.user_id
        user_tag.tag_id = tag_id
        user_tags.append({'user_id':user_access.user_id,'tag_id':tag_id})
    user_shelves = []
    for shelf_id in user_access.shelf_ids:
        user_shelf = dbi.dm.UserShelf()
        user_shelf.user_id = user_access.user_id
        user_shelf.shelf_id = shelf_id
        user_shelves.append({'user_id':user_access.user_id,'shelf_id':shelf_id})
    user_stream_sources = []
    for stream_source_id in user_access.stream_source_ids:
        user_stream_source = dbi.dm.UserStreamSource()
        user_stream_source.user_id = user_access.user_id
        user_stream_source.stream_source_id = stream_source_id
        user_stream_sources.append({'user_id':user_access.user_id,'stream_source_id':stream_source_id})
    with dbi.session() as db:
        db.query(dbi.dm.UserTag).filter(dbi.dm.UserTag.user_id == user_access.user_id).delete()
        db.query(dbi.dm.UserShelf).filter(dbi.dm.UserShelf.user_id == user_access.user_id).delete()
        db.query(dbi.dm.UserStreamSource).filter(dbi.dm.UserStreamSource.user_id == user_access.user_id).delete()
        db.commit()
        db.bulk_insert_mappings(dbi.dm.UserTag, user_tags)
        db.bulk_insert_mappings(dbi.dm.UserShelf, user_shelves)
        db.bulk_insert_mappings(dbi.dm.UserStreamSource, user_stream_sources)
        db.commit()
    return True