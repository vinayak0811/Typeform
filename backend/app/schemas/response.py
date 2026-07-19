from datetime import datetime

from pydantic import BaseModel, ConfigDict, model_validator


class AnswerSubmit(BaseModel):
    """One answer coming in from the public form submission payload."""
    question_id: str
    value_text: str | None = None
    value_number: float | None = None
    choice_id: str | None = None

    @model_validator(mode="after")
    def _at_least_one_value(self):
        # An "empty" answer (skipped optional question) is allowed — all None.
        return self


class ResponseSubmit(BaseModel):
    completed: bool = True
    answers: list[AnswerSubmit] = []


class AnswerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    question_id: str
    value_text: str | None
    value_number: float | None
    choice_id: str | None


class ResponseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    form_id: str
    completed: bool
    submitted_at: datetime


class ResponseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    form_id: str
    completed: bool
    submitted_at: datetime
    answers: list[AnswerRead] = []


class PaginatedResponses(BaseModel):
    items: list[ResponseListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
