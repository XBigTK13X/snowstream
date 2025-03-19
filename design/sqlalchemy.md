# Loading Related Data

I did a lot of back and forth about `join` vs `joinedload`.

At my current understanding, if you `join` then you need to also specify `contains_eager`, duplicating some of the declarative stuff already defined in the models.

Using `joinedload` instead better leverages those declarative attributes to build the joins for you and eagerly load the specified props.