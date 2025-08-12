from database.operation.db_internal import dbi

def create_streamable(stream_source_id: int, url: str, name: str, group: str=None):
    with dbi.session() as db:
        dbm = dbi.dm.Streamable()
        dbm.name = name
        dbm.url = url
        dbm.stream_source_id = stream_source_id
        dbm.group = group
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_streamable_by_id(streamable_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Streamable)
            .options(dbi.orm.joinedload(dbi.dm.Streamable.stream_source))
            .filter(dbi.dm.Streamable.id == streamable_id)
            .first()
        )