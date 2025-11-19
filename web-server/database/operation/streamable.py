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

def update_streamable_display(
    streamable_id:str,
    group_display:str=None,
    name_display:str=None
):
    if not streamable_id:
        return None
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Streamable)
            .filter(dbi.dm.Streamable.id == streamable_id)
            .update({
                'group_display': group_display,
                'name_display': name_display
            })
        )
        db.commit()
        return get_streamable_by_id(streamable_id=streamable_id)

def get_streamable_list(ticket:dbi.dm.Ticket,stream_source_id:int=None,search_query:str=None):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.Streamable)
            .outerjoin(dbi.dm.Channel, dbi.dm.Streamable.channel)
            .options(
                dbi.orm.joinedload(dbi.dm.Streamable.stream_source),
                dbi.orm.joinedload(dbi.dm.Streamable.channel)
                    .joinedload(dbi.dm.Channel.programs),
            )
        )
        if stream_source_id:
            query = query.filter(dbi.dm.Streamable.stream_source_id == stream_source_id)
        if search_query:
            query = query.filter(dbi.or_(
                dbi.dm.Channel.parsed_name.ilike(f"%{search_query}%"),
                dbi.dm.Channel.edited_name.ilike(f"%{search_query}%"),
                dbi.dm.Streamable.url.ilike(f"%{search_query}%"),
                dbi.dm.Streamable.name.ilike(f"%{search_query}%"),
                dbi.dm.Streamable.name_display.ilike(f"%{search_query}%"),
                dbi.dm.Streamable.group.ilike(f"%{search_query}%"),
                dbi.dm.Streamable.group_display.ilike(f"%{search_query}%"),
            ))
        if ticket.has_tag_restrictions():
            pass
        if ticket.has_stream_source_restrictions():
            pass
        return query.all()

def get_streamable_by_id(streamable_id: int):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Streamable)
            .options(dbi.orm.joinedload(dbi.dm.Streamable.stream_source))
            .options(dbi.orm.joinedload(dbi.dm.Streamable.tags))
            .filter(dbi.dm.Streamable.id == streamable_id)
            .first()
        )

def delete_streamables_by_stream_source(stream_source_id:int):
    if not stream_source_id:
        return False
    with dbi.session() as db:
        (
            db.query(dbi.dm.Streamable)
            .filter(dbi.dm.Streamable.stream_source_id == stream_source_id)
            .delete()
        )
        db.commit()
        return True

def upsert_streamable_tag(streamable_id:int,tag_id:int):
    if not streamable_id:
        return None
    with dbi.session() as db:
        streamable_tag = db.query(dbi.dm.StreamableTag).filter(
            dbi.dm.StreamableTag.streamable_id == streamable_id,
            dbi.dm.StreamableTag.tag_id == tag_id,
        ).first()
        if streamable_tag:
            return streamable_tag

        dbm = dbi.dm.StreamableTag()
        dbm.tag_id = tag_id
        dbm.streamable_id = streamable_id
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm
