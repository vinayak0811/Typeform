import uuid


def new_uuid() -> str:
    """Return a new UUID4 as a string, used as primary keys across all models."""
    return str(uuid.uuid4())
