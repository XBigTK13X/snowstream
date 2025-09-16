from database.operation.db_internal import dbi

def get_channel_guide_source_list(schedules=False):
    with dbi.session() as db:
        if schedules:
            sql = dbi.sa.select(dbi.dm.ChannelGuideSource).options(
                dbi.orm.joinedload(dbi.dm.ChannelGuideSource.channels)
            )
            return db.scalars(sql).unique().all()
        return db.query(dbi.dm.ChannelGuideSource).all()

def create_channel(channel: dict):
    with dbi.session() as db:
        dbm = dbi.dm.Channel(**channel)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_channel_by_parsed_id(parsed_id: str):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.StreamableChannel)
            .filter(dbi.dm.StreamableChannel.parsed_id == parsed_id)
            .first()
        )

def create_channel_program(schedule: dict):
    with dbi.session() as db:
        dbm = dbi.dm.StreamableSchedule(**schedule)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def create_channel_programs(schedules:list):
    with dbi.session() as db:
        db.bulk_insert_mappings(dbi.dm.StreamableSchedule, schedules)

def get_channel_program_list():
    with dbi.session() as db:
        return db.query(dbi.dm.StreamableSchedule).all()

def delete_all_channel_programs():
    with dbi.session() as db:
        db.execute(dbi.sql_text('truncate channel_program;'))