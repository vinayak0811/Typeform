from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import QuestionType
from app.schemas.choice import ChoiceCreate, ChoiceRead


class QuestionBase(BaseModel):
    type: QuestionType
    title: str = ""
    description: str | None = ""
    required: bool = False
    order: int = 0
    settings: dict[str, Any] = Field(default_factory=dict)


class QuestionCreate(QuestionBase):
    choices: list[ChoiceCreate] = Field(default_factory=list)


class QuestionUpdate(BaseModel):
    type: QuestionType | None = None
    title: str | None = None
    description: str | None = None
    required: bool | None = None
    order: int | None = None
    settings: dict[str, Any] | None = None
    choices: list[ChoiceCreate] | None = None


class QuestionReorderItem(BaseModel):
    id: str
    order: int


class QuestionRead(QuestionBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    form_id: str
    choices: list[ChoiceRead] = Field(default_factory=list)
