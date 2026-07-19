import re

from app.models.form import Form
from app.models.enums import QuestionType, CHOICE_BASED_TYPES
from app.schemas.response import ResponseSubmit

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ValidationError(Exception):
    def __init__(self, errors: dict[str, str]):
        self.errors = errors
        super().__init__("Validation failed")


def validate_submission(form: Form, payload: ResponseSubmit) -> None:
    """
    Mirrors the client-side (Zod) validation rules so the API never trusts
    the browser: required fields must be present, email must be well-formed,
    choice ids must belong to the question, and ratings/numbers must be in
    range. Raises ValidationError({question_id: message}) on any failure.
    """
    answers_by_question = {a.question_id: a for a in payload.answers}
    errors: dict[str, str] = {}

    for question in form.questions:
        answer = answers_by_question.get(question.id)
        is_empty = answer is None or (
            answer.value_text in (None, "")
            and answer.value_number is None
            and answer.choice_id is None
        )

        if question.required and is_empty:
            errors[question.id] = "This question is required."
            continue

        if is_empty:
            continue

        if question.type == QuestionType.EMAIL:
            if not answer.value_text or not EMAIL_RE.match(answer.value_text):
                errors[question.id] = "Please enter a valid email address."

        elif question.type in CHOICE_BASED_TYPES:
            valid_ids = {c.id for c in question.choices}
            if not answer.choice_id or answer.choice_id not in valid_ids:
                errors[question.id] = "Please select a valid option."

        elif question.type == QuestionType.YES_NO:
            if answer.value_text not in ("yes", "no"):
                errors[question.id] = "Please select yes or no."

        elif question.type == QuestionType.NUMBER:
            if answer.value_number is None:
                errors[question.id] = "Please enter a number."

        elif question.type == QuestionType.RATING:
            max_rating = (question.settings or {}).get("max_rating", 5)
            if answer.value_number is None or not (1 <= answer.value_number <= max_rating):
                errors[question.id] = f"Please select a rating between 1 and {max_rating}."

        elif question.type in (QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT):
            if not answer.value_text or not answer.value_text.strip():
                errors[question.id] = "This field cannot be empty."

    if errors:
        raise ValidationError(errors)
