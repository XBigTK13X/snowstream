from sqlalchemy.orm import Session

import db_models as dm
import api_models as am

def get_iptv_source_list(db: Session):
    return db.query(dm.IptvSource).all()

def get_iptv_source_by_url(db: Session, url: str):
    return db.query(dm.IptvSource).filter(dm.IptvSource.url == url).first()

def create_iptv_source(db: Session, iptv_source: am.IptvSource):
    db_source = dm.IptvSource(**iptv_source.dict())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source