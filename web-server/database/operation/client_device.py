import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.sql import func
import util

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

def get_client_device_user(client_device_id:int,user_id:int):
    with DbSession() as db:
        query = db.query(dm.ClientDeviceUser)
        return query.filter(
            dm.ClientDeviceUser.client_device_id == client_device_id,
            dm.ClientDeviceUser.user_id == user_id
        ).first()

