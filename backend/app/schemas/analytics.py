from typing import Any

from pydantic import BaseModel

from app.models.enums import QuestionType


class ChoiceDistributionItem(BaseModel):
    choice_id: str
    label: str
    count: int
    percentage: float


class QuestionStat(BaseModel):
    question_id: str
    title: str
    type: QuestionType
    answered_count: int
    skipped_count: int

    # Choice-based (multiple_choice / dropdown / yes_no)
    choice_distribution: list[ChoiceDistributionItem] | None = None

    # Numeric (number / rating)
    average: float | None = None
    min_value: float | None = None
    max_value: float | None = None

    # Text-based — a small sample of recent free-text answers
    sample_answers: list[str] | None = None


class FormAnalytics(BaseModel):
    form_id: str
    total_responses: int
    completed_responses: int
    completion_rate: float
    question_stats: list[QuestionStat]
