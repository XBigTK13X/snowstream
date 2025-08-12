from database.operation.db_internal import dbi

def create_channel(channel: dict):
    with dbi.session() as db:
        dbm = dbi.dm.StreamableChannel(**channel)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm


def get_channels_list(schedules=False):
    with dbi.session() as db:
        if schedules:
            sql = dbi.sa.select(dbi.dm.StreamableChannel).options(
                dbi.orm.joinedload(dbi.dm.StreamableChannel.schedules)
            )
            return db.scalars(sql).unique().all()
        return db.query(dbi.dm.StreamableChannel).all()


def get_channel_by_parsed_id(parsed_id: str):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.StreamableChannel)
            .filter(dbi.dm.StreamableChannel.parsed_id == parsed_id)
            .first()
        )
