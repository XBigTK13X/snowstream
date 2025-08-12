from database.operation.db_internal import dbi

def create_job(kind: str, input:dict=None):
    db_job = dbi.dm.Job()
    db_job.kind = kind
    db_job.status = "pending"
    db_job.message = "Waiting for a worker to start the job."
    db_job.logs_json = dbi.json.dumps([db_job.message])
    if input:
        db_job.input_json = dbi.json.dumps(input)
    with dbi.session() as db:
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
    return db_job


def get_job_list(show_complete:bool=True,limit:int=50):
    with dbi.session() as db:
        return (
            db.query(dbi.dm.Job)
            .filter(True if show_complete else dbi.dm.Job.status != 'complete')
            .order_by(dbi.desc(dbi.dm.Job.id))
            .limit(limit)
            .all()
        )


def get_job_by_id(job_id: int):
    with dbi.session() as db:
        job = db.query(dbi.dm.Job).filter(dbi.dm.Job.id == job_id).first()
        if not job:
            return None
        if job.logs_json:
            job.logs = dbi.json.loads(job.logs_json)
        if job.input_json:
            job.input = dbi.json.loads(job.input_json)
        return job

def update_job(job_id: int, message:str=None, status:str=None):
    if job_id == None:
        return None
    with dbi.session() as db:
        job = db.query(dbi.dm.Job).filter(dbi.dm.Job.id == job_id).first()
        if not job:
            return None
        if message:
            dbi.log.info(message)
            job.message = message
            logs = dbi.json.loads(job.logs_json)
            logs.append(f'{dbi.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} | {message}')
            job.logs_json = dbi.json.dumps(logs)
        if status:
            dbi.log.info(f"Updating job {job_id} to status {status}")
            job.status = status
        db.commit()
        return job
