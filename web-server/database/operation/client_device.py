import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.sql import func
import util
import database.operation.user as db_user

def create_client_device(device_name:str):
    with DbSession() as db:
        dbm = dm.ClientDevice()
        dbm.reported_name = device_name
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_client_device_by_reported_name(device_name:str):
    with DbSession() as db:
        query = db.query(dm.ClientDevice)
        return query.filter(dm.ClientDevice.reported_name == device_name).first()

def create_client_device_user(client_device_id:int,user_id:int):
    with DbSession() as db:
        dbm = dm.ClientDeviceUser()
        dbm.client_device_id = client_device_id
        dbm.user_id = user_id
        dbm.last_connection = func.now()
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def get_client_device_user_by_ids(client_device_id:int,user_id:int):
    with DbSession() as db:
        query = db.query(dm.ClientDeviceUser)
        return query.filter(
            dm.ClientDeviceUser.client_device_id == client_device_id,
            dm.ClientDeviceUser.user_id == user_id
        ).first()

def get_client_device_user_by_cduid(cduid:int):
    with DbSession() as db:
        query = db.query(dm.ClientDeviceUser)
        return query.filter(
            dm.ClientDeviceUser.id == cduid,
        ).first()

def get_ticket_by_cduid(cduid:int):
    ticket = dm.Ticket()
    ticket.client = get_client_device_user_by_cduid(cduid=cduid)
    if not ticket.client:
        return None
    ticket.cduid = ticket.client.id
    isolation = ticket.client.isolation_mode
    # Default isolation mode is Loud
    if isolation == None:
        isolation = 'Loud'
    with DbSession() as db:
        ticket.tag_ids = (
            db.query(dm.UserTag).filter(dm.UserTag.user_id == ticket.client.user_id).all()
        )
        ticket.tag_ids = [xx.tag_id for xx in ticket.tag_ids]
        if len(ticket.tag_ids) == 0:
            ticket.tag_ids = None
        ticket.shelf_ids = (
            db.query(dm.UserShelf).filter(dm.UserShelf.user_id == ticket.client.user_id).all()
        )
        ticket.shelf_ids = [xx.shelf_id for xx in ticket.shelf_ids]
        if len(ticket.shelf_ids) == 0:
            ticket.shelf_ids = None
        ticket.stream_source_ids = (
            db.query(dm.UserStreamSource).filter(dm.UserStreamSource.user_id == ticket.client.user_id).all()
        )
        ticket.stream_source_ids = [xx.stream_source_id for xx in ticket.stream_source_ids]
        if len(ticket.stream_source_ids) == 0:
            ticket.stream_source_ids = None
        if isolation == 'Silent' or isolation == 'Shout':
            ticket.watch_group = [ticket.cduid]
            return ticket
        if isolation == 'Quiet' or isolation == 'Loud':
            watch_group = (
                db.query(dm.ClientDeviceUser)
                .filter(
                    dm.ClientDeviceUser.id != ticket.cduid,
                    dm.ClientDeviceUser.user_id == ticket.client.user_id,
                    (dm.ClientDeviceUser.isolation_mode.in_(['Loud','Shout']))
                    | (dm.ClientDeviceUser.isolation_mode == None)
                )
                .all()
            )
            # TODO I think there needs to be a read group and write group
            # On read, you will care about any device that watched
            # On write, you will want to delete all the other watched entries depending on the isolation mode
            ticket.watch_group = [xx.id for xx in watch_group]
            ticket.watch_group.insert(0,ticket.cduid)
            return ticket
        log.error(f"Unknown isolation mode encountered! [{ticket.client.isolation_mode}]")
        return ticket