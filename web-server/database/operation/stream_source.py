from database.operation.db_internal import dbi
import api_models as am

def create_stream_source(stream_source: am.StreamSource):
    with dbi.session() as db:
        db_source = dbi.dm.StreamSource(**stream_source.model_dump())
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
        return db_source

def get_stream_source_list(
    ticket:dbi.dm.Ticket=None,
    streamables:bool=False):
    with dbi.session() as db:
        query = (
            db.query(dbi.dm.StreamSource)
        )
        if ticket.has_stream_source_restrictions():
            query = query.filter(dbi.dm.StreamSource.id.in_(ticket.stream_source_ids))
        if ticket.has_tag_restrictions():
            query = query.options(dbi.orm.joinedload(dbi.dm.StreamSource.tags))
        if streamables:
            query = query.options(
                dbi.orm.joinedload(dbi.dm.StreamSource.streamables)
                .joinedload(dbi.dm.Streamable.channel)
                .joinedload(dbi.dm.Channel.programs)
            )
        stream_sources = query.all()
        results = []
        for stream_source in stream_sources:
            if not ticket.is_allowed(tag_provider=stream_source.get_tag_ids):
                continue
            results.append(stream_source)
        return results

def get_stream_source_by_id(ticket:dbi.dm.Ticket,stream_source_id: int):
    with dbi.session() as db:
        stream_source = (
            db.query(dbi.dm.StreamSource)
            .options(
                dbi.orm.joinedload(dbi.dm.StreamSource.streamables)
                .joinedload(dbi.dm.Streamable.channel)
                .joinedload(dbi.dm.Channel.programs)
            )
            .options(dbi.orm.joinedload(dbi.dm.StreamSource.tags))
            .filter(dbi.dm.StreamSource.id == stream_source_id)
            .first()
        )
        if not ticket.is_allowed(tag_provider=stream_source.get_tag_ids):
            return None
        if stream_source.kind != 'TubeArchivist':
            stream_source.streamables = sorted(stream_source.streamables,key=lambda xx:xx.name)
        return stream_source

def get_stream_source_by_url(url: str):
    with dbi.session() as db:
        return db.query(dbi.dm.StreamSource).filter(dbi.dm.StreamSource.url == url).first()

def upsert_stream_source(ticket:dbi.dm.Ticket, stream_source: am.StreamSource):
    existing_stream_source = None
    if stream_source.id:
        existing_stream_source = get_stream_source_by_id(ticket=ticket,stream_source_id=stream_source.id)
    if not existing_stream_source:
        return create_stream_source(stream_source)
    with dbi.session() as db:
        existing_stream_source = (
            db.query(dbi.dm.StreamSource)
            .filter(dbi.dm.StreamSource.id == stream_source.id)
            .update(stream_source.model_dump())
        )
        db.commit()
        return existing_stream_source


def delete_stream_source_by_id(stream_source_id: str):
    with dbi.session() as db:
        deleted = db.query(dbi.dm.StreamSource).filter(dbi.dm.StreamSource.id == stream_source_id).delete()
        db.commit()
        return deleted