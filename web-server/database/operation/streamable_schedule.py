from database.operation.db_internal import dbi

def create_schedule(schedule: dict):
    with dbi.session() as db:
        dbm = dbi.dm.StreamableSchedule(**schedule)
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def create_schedules(schedules:list):
    with dbi.session() as db:
        db.bulk_insert_mappings(dbi.dm.StreamableSchedule, schedules)

def get_schedules_list():
    with dbi.session() as db:
        return db.query(dbi.dm.StreamableSchedule).all()

def delete_all_schedules():
    with dbi.session() as db:
        db.execute(dbi.sql_text('truncate streamable_schedule;'))
