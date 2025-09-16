from database.operation.db_internal import dbi
import api_models as am

def create_channel_guide_source(guide_source: am.ChannelGuideSource):
    with dbi.session() as db:
        db_source = dbi.dm.ChannelGuideSource(**guide_source.model_dump())
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
        return db_source


def get_channel_guide_source_by_id(channel_guide_source_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.ChannelGuideSource)
            .options(dbi.orm.joinedload(dbi.dm.ChannelGuideSource.channels))
            .filter(dbi.dm.ChannelGuideSource.id == channel_guide_source_id)
            .first()
        )

def upsert_channel_guide_source(guide_source: am.ChannelGuideSource):
    existing_guide_source = None
    if guide_source.id:
        existing_guide_source = get_channel_guide_source_by_id(channel_guide_source_id=guide_source.id)
    if not existing_guide_source:
        return create_channel_guide_source(guide_source)
    with dbi.session() as db:
        existing_guide_source = (
            db.query(dbi.dm.ChannelGuideSource)
            .filter(dbi.dm.ChannelGuideSource.id == guide_source.id)
            .update(guide_source.model_dump())
        )
        db.commit()
        return existing_guide_source

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

def update_channel(channel: am.Channel):
    with dbi.session() as db:
        model = channel.model_dump()
        streamable_id = model['streamable_id']
        del model['streamable_id']
        dbm = dbi.dm.Channel(**model)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        channel_model = dbm
        if streamable_id:
            (
                db.query(dbi.dm.StreamableChannel)
                .filter(dbi.dm.StreamableChannel.id == channel.id)
                .delete()
            )
            db.commit()
            dbm = dbi.dm.StreamableChannel()
            dbm.streamable_id = streamable_id
            dbm.channel_id = channel.id
            db.add(dbm)
            db.commit()
            db.refresh(dbm)
        return channel_model

def get_channel_by_parsed_id(parsed_id: str):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Channel)
            .filter(dbi.dm.Channel.parsed_id == parsed_id)
            .first()
        )

def get_channel_list():
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Channel)
            .options(dbi.orm.joinedload(dbi.dm.Channel.programs))
            .all()
        )

def create_channel_program(program: dict):
    with dbi.session() as db:
        dbm = dbi.dm.ChannelProgram(**program)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def create_channel_programs(programs:list):
    with dbi.session() as db:
        db.bulk_insert_mappings(dbi.dm.ChannelProgram, programs)

def get_channel_program_list():
    with dbi.session() as db:
        return db.query(dbi.dm.ChannelProgram).all()

def delete_all_channel_programs():
    with dbi.session() as db:
        db.execute(dbi.sql_text('truncate channel_program;'))