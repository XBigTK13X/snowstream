from database.operation.db_internal import dbi

def create_client_device(device_name:str):
    with dbi.session() as db:
        dbm = dbi.dm.ClientDevice()
        dbm.reported_name = device_name
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_client_device_by_reported_name(device_name:str):
    with dbi.session() as db:
        query = db.query(dbi.dm.ClientDevice)
        return query.filter(dbi.dm.ClientDevice.reported_name == device_name).first()

def create_client_device_user(client_device_id:int,user_id:int):
    with dbi.session() as db:
        dbm = dbi.dm.ClientDeviceUser()
        dbm.client_device_id = client_device_id
        dbm.user_id = user_id
        dbm.last_connection = dbi.func.now()
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_client_device_user_by_ids(client_device_id:int,user_id:int):
    with dbi.session() as db:
        query = db.query(dbi.dm.ClientDeviceUser)
        return query.filter(
            dbi.dm.ClientDeviceUser.client_device_id == client_device_id,
            dbi.dm.ClientDeviceUser.user_id == user_id
        ).first()

def get_client_device_user_by_cduid(cduid:int):
    with dbi.session() as db:
        query = db.query(dbi.dm.ClientDeviceUser).options(dbi.orm.joinedload(dbi.dm.ClientDeviceUser.client_device))
        return query.filter(
            dbi.dm.ClientDeviceUser.id == cduid,
        ).first()

def get_ticket_by_cduid(cduid:int):
    ticket = dbi.Ticket()
    ticket.client = get_client_device_user_by_cduid(cduid=cduid)
    if not ticket.client:
        return None
    ticket.cduid = ticket.client.id
    isolation = ticket.client.isolation_mode
    # Default isolation mode is Loud
    if isolation == None:
        isolation = 'Loud'
    with dbi.session() as db:
        ticket.tag_ids = (
            db.query(dbi.dm.UserTag).filter(dbi.dm.UserTag.user_id == ticket.client.user_id).all()
        )
        ticket.tag_ids = [xx.tag_id for xx in ticket.tag_ids]
        if len(ticket.tag_ids) == 0:
            ticket.tag_ids = None
        ticket.shelf_ids = (
            db.query(dbi.dm.UserShelf).filter(dbi.dm.UserShelf.user_id == ticket.client.user_id).all()
        )
        ticket.shelf_ids = [xx.shelf_id for xx in ticket.shelf_ids]
        if len(ticket.shelf_ids) == 0:
            ticket.shelf_ids = None
        ticket.stream_source_ids = (
            db.query(dbi.dm.UserStreamSource).filter(dbi.dm.UserStreamSource.user_id == ticket.client.user_id).all()
        )
        ticket.stream_source_ids = [xx.stream_source_id for xx in ticket.stream_source_ids]
        if len(ticket.stream_source_ids) == 0:
            ticket.stream_source_ids = None
        if isolation == 'Silent' or isolation == 'Shout':
            ticket.watch_group = [ticket.cduid]
            return ticket
        if isolation == 'Quiet' or isolation == 'Loud':
            watch_group = (
                db.query(dbi.dm.ClientDeviceUser)
                .filter(
                    dbi.dm.ClientDeviceUser.id != ticket.cduid,
                    dbi.dm.ClientDeviceUser.user_id == ticket.client.user_id,
                    (dbi.dm.ClientDeviceUser.isolation_mode.in_(['Loud','Shout']))
                    | (dbi.dm.ClientDeviceUser.isolation_mode == None)
                )
                .all()
            )
            ticket.watch_group = [xx.id for xx in watch_group]
            ticket.watch_group.insert(0,ticket.cduid)
            return ticket
        dbi.log.error(f"Unknown isolation mode encountered! [{ticket.client.isolation_mode}]")
        return ticket