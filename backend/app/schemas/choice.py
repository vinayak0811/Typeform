from pydantic import BaseModel, ConfigDict


class ChoiceBase(BaseModel):
    label: str
    order: int = 0


class ChoiceCreate(ChoiceBase):
    id: str | None = None  # allow client-generated ids so the builder can reference them before save


class ChoiceUpdate(BaseModel):
    label: str | None = None
    order: int | None = None


class ChoiceRead(ChoiceBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    question_id: str
