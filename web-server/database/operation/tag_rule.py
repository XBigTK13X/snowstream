from database.operation.db_internal import dbi

def create_tag_rule(
    tag_id:int=None,
    rule_kind:str=None,
    priority:int=None,
    target_kind:str=None,
    trigger_kind:str=None,
    trigger_target:str=None
):
    with dbi.session() as db:
        dbm = dbi.dm.TagRule()
        dbm.tag_id = tag_id
        dbm.rule_kind = rule_kind
        dbm.priority = priority
        dbm.target_kind = target_kind
        dbm.trigger_kind = trigger_kind
        dbm.trigger_target = trigger_target
        db.add(dbm)
        db.commit()
        db.refresh(dbm)
        return dbm

def update_tag_rule(
    rule_id:int,
    tag_id:int=None,
    rule_kind:str=None,
    priority:int=None,
    target_kind:str=None,
    trigger_kind:str=None,
    trigger_target:str=None
):
    with dbi.session() as db:
        rule = db.query(dbi.dm.TagRule).filter(dbi.dm.TagRule.id == rule_id)
        rule.tag_id = tag_id
        rule.rule_kind = rule_kind
        rule.priority = priority
        rule.target_kind = target_kind
        rule.trigger_kind = trigger_kind
        rule.trigger_target = trigger_target
        rule.save()
        db.commit()
        db.refresh(rule)
        return rule

def get_tag_rule(rule_id:int):
    if rule_id == None:
        return None
    with dbi.session() as db:
        return (
            db.query(dbi.dm.TagRule)
            .filter(dbi.dm.TagRule.id == rule_id)
            .options(dbi.orm.joinedload(dbi.dm.TagRule.tag))
            .first()
        )

def delete_tag_rule(rule_id:int):
    if rule_id == None:
        return False
    with dbi.session() as db:
        db.query(dbi.dm.TagRule).filter(dbi.dm.TagRule.id == rule_id).delete()
        return True

def get_tag_rule_list(target_kind:str=None):
    with dbi.session() as db:
        query = db.query(dbi.dm.TagRule).options(dbi.orm.joinedload(dbi.dm.TagRule.tag))

        if target_kind:
            query = query.filter(dbi.or_(
                dbi.dm.TagRule.target_kind == None,
                dbi.dm.TagRule.target_kind == target_kind
            )
        )
        query = query.order_by(dbi.dm.TagRule.priority)
        return query.all()