from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import FormStatus
from app.schemas.question import QuestionRead


class FormBase(BaseModel):
    title: str = "Untitled Form"
    description: str | None = ""


class FormCreate(FormBase):
    pass


class FormUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class FormListItem(BaseModel):
    """Lightweight shape for the dashboard grid — avoids shipping full question trees."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None
    status: FormStatus
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
    response_count: int = 0
    question_count: int = 0


class FormRead(FormBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: FormStatus
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
    questions: list[QuestionRead] = Field(default_factory=list)


class FormPublicRead(BaseModel):
    """Shape exposed on the public /forms/{id}/public endpoint — no internal metadata."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None
    status: FormStatus
    questions: list[QuestionRead] = Field(default_factory=list)
