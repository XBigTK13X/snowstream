import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log


def create_job(kind: str):
    db_job = dm.Job()
    db_job.kind = kind
    db_job.status = "pending"
    db_job.message = "Waiting for a worker to start the job."
    with DbSession() as db:
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
    return db_job


def get_job_list():
    with DbSession() as db:
        return db.query(dm.Job).all()


def get_job_by_id(job_id: int):
    with DbSession() as db:
        return db.query(dm.Job).filter(dm.Job.id == job_id).first()


def update_job(job_id: int, message: str = None, status: str = None):
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
