from database.operation.db_internal import dbi

def create_display_cleanup_rule(
    priority:int=None,
    needle:str=None,
    replacement:str=None,
    target_kind:str=None,
    rule_kind:str=None
):
    with dbi.session() as db:
        dbm = dbi.dm.DisplayCleanupRule()
        dbm.priority = priority
        dbm.needle = needle
        dbm.replacement = replacement
        dbm.target_kind = target_kind
        dbm.rule_kind = rule_kind
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def update_display_cleanup_rule(
    rule_id:int,
    priority:int=None,
    needle:str=None,
    replacement:str=None,
    target_kind:str=None,
    rule_kind:str=None
):
    with dbi.session() as db:
        rule = db.query(dbi.dm.DisplayCleanupRule).filter(dbi.dm.DisplayCleanupRule.id == rule_id)
        rule.priority = priority
        rule.needle = needle
        rule.replacement = replacement
        rule.target_kind = target_kind
        rule.rule_kind = rule_kind
        rule.save()
        db.commit()
        db.refresh(rule)
        return rule

def get_display_cleanup_rule(rule_id:int):
    if rule_id == None:
        return None
    with dbi.session() as db:
        return db.query(dbi.dm.DisplayCleanupRule).filter(dbi.dm.DisplayCleanupRule.id == rule_id).first()

def delete_display_cleanup_rule(rule_id:int):
    if rule_id == None:
        return False
    with dbi.session() as db:
        db.query(dbi.dm.DisplayCleanupRule).filter(dbi.dm.DisplayCleanupRule.id == rule_id).delete()
        return True

def get_display_cleanup_rule_list(target_kind:str=None):
    with dbi.session() as db:
        query = db.query(dbi.dm.DisplayCleanupRule)

        if target_kind:
            query = query.filter(dbi.or_(
                dbi.dm.DisplayCleanupRule.target_kind == None,
                dbi.dm.DisplayCleanupRule.target_kind == target_kind
            )
        )
        query = query.order_by(dbi.dm.DisplayCleanupRule.priority)
        return query.all()