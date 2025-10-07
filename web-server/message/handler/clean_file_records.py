from log import log
from db import db

from message.job_media_scope import JobMediaScope

def handle(scope:JobMediaScope):
    db.op.update_job(job_id=scope.job_id, message=f"[WORKER] Handling a clean_file_records job")

    db.op.update_job(job_id=scope.job_id, message=f"Checking for orphaned records")
    results = db.op.purge_orphaned_records()
    if results:
        db.op.update_job(job_id=scope.job_id, message=f'Purged {len(results)} orphaned records')
        for result in results:
            db.op.update_job(job_id=scope.job_id, message=f"    {result}")

    if scope.is_orphan():
        return True

    db.op.update_job(job_id=scope.job_id, message=f"Checking for deleted metadata files")
    results = db.op.purge_missing_metadata_file_records()
    if results:
        db.op.update_job(job_id=scope.job_id, message=f"Purged {len(results)} metadata file records")
        for result in results:
            db.op.update_job(job_id=scope.job_id, message=f"    {result}")

    db.op.update_job(job_id=scope.job_id, message=f"Checking for deleted image files")
    results = db.op.purge_missing_image_file_records()
    if results:
        db.op.update_job(job_id=scope.job_id, message=f"Purged {len(results)} image file records")
        for result in results:
            db.op.update_job(job_id=scope.job_id, message=f"    {result}")

    db.op.update_job(job_id=scope.job_id, message=f"Checking for deleted video files")
    results = db.op.purge_missing_video_file_records()
    if results:
        db.op.update_job(job_id=scope.job_id, message=f"Purged {len(results)} video file records")
        for result in results:
            db.op.update_job(job_id=scope.job_id, message=f"    {result}")

    db.op.update_job(job_id=scope.job_id, message=f"Searching for any content without video files")
    results = db.op.purge_shelf_content_without_video_files()
    if results:
        db.op.update_job(job_id=scope.job_id, message=f"Found {len(results)} shelf entries without video files")
        for result in results:
            db.op.update_job(job_id=scope.job_id, message=f"    {result}")

    return True
