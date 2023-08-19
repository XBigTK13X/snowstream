import db_models as dm
import api_models as am
from database import DbSession
import message.write
from log import log


def create_stream_source(stream_source: am.StreamSource):
    db_source = dm.StreamSource(**stream_source.dict())
    with DbSession() as db:
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
        return db_source


def get_stream_source_list():
    with DbSession() as db:
        return db.query(dm.StreamSource).all()


def get_stream_source_by_url(url: str):
    with DbSession() as db:
        return db.query(dm.StreamSource).filter(dm.StreamSource.url == url).first()


def create_job(kind: str):
    db_job = dm.Job()
    db_job.kind = kind
    db_job.status = "pending"
    db_job.message = "Waiting for a worker to start the job."
    with DbSession() as db:
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
    message.write.send(job_id=db_job.id, kind=kind)
    return db_job


def get_job_list():
    with DbSession() as db:
        return db.query(dm.Job).all()


def get_job_by_id(job_id: int):
    with DbSession() as db:
        return db.query(dm.Job).filter(dm.Job.id == job_id).first()


def update_job(job_id: int, message: str, status: str):
    with DbSession() as db:
        job = db.query(dm.Job).filter(dm.Job.id == job_id).first()
        if message:
            log.info(f'Updating job {job_id} to message {message}')
            job.message = message
        if status:
            log.info(f'Updating job {job_id} to status {status}')
            job.status = status
        db.commit()
        return job
