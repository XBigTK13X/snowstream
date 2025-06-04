from db import db
import message.write

def create_child_job(name:str,payload:dict):
    job = db.op.create_job(kind=name,input=payload)
    message.write.send(job_id=job.id, kind=name, input=payload)
    return job