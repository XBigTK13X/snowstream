import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession,desc
from log import log
import json
from datetime import datetime

def create_job(kind: str, input:dict=None):
    db_job = dm.Job()
    db_job.kind = kind
    db_job.status = "pending"
    db_job.message = "Waiting for a worker to start the job."
    db_job.logs_json = json.dumps([db_job.message])
    if input:
        db_job.input_json = json.dumps(input)
    with DbSession() as db:
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
    return db_job


def get_job_list(show_complete:bool=True,limit:int=50):
    with DbSession() as db:
        return (
            db.query(dm.Job)
            .filter(True if show_complete else dm.Job.status != 'complete')
            .order_by(desc(dm.Job.id))
            .limit(limit)
            .all()
        )


def get_job_by_id(job_id: int):
    with DbSession() as db:
        job = db.query(dm.Job).filter(dm.Job.id == job_id).first()
        if not job:
            return None
        if job.logs_json:
            job.logs = json.loads(job.logs_json)
        if job.input_json:
            job.input = json.loads(job.input_json)
        return job

def update_job(job_id: int, message:str=None, status:str=None):
    if job_id == None:
        return None
    with DbSession() as db:
        job = db.query(dm.Job).filter(dm.Job.id == job_id).first()
        if not job:
            return None
        if message:
            log.info(message)
            job.message = message
            logs = json.loads(job.logs_json)
            logs.append(f'{datetime.now().strftime("%Y-%m-%d %H:%M:%S")} | {message}')
            job.logs_json = json.dumps(logs)
        if status:
            log.info(f"Updating job {job_id} to status {status}")
            job.status = status
        db.commit()
        return job
