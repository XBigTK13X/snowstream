from sqlalchemy.orm import Session

import db_models as dm
import api_models as am

def create_stream_source(db: Session, stream_source: am.StreamSource):
    db_source = dm.StreamSource(**stream_source.dict())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

def get_stream_source_list(db: Session):
    return db.query(dm.StreamSource).all()

def get_stream_source_by_url(db: Session, url: str):
    return db.query(dm.StreamSource).filter(dm.StreamSource.url == url).first()

def create_job(db: Session, kind: str):
    db_job = dm.Job()
    db_job.kind = kind
    db_job.status = "pending"
    db_job.message = "Waiting for a worker to start the job."
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_job_list(db: Session):
    return db.query(dm.Job).all()

def get_job_by_id(db: Session, job_id: int):
    return db.query(dm.Job).filter(dm.Job.id == job_id).first()

def update_job_log(db: Session, job_id: int, message: str):
    job = db.query(dm.Job).filter(dm.Job.id == job_id)
    job.message = message
    db.add(job)
    db.commit()
    return job

