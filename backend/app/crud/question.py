from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.form import Form
from app.models.question import Question
from app.models.choice import Choice
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionReorderItem


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_question(db: Session, question_id: str) -> Question | None:
    return db.get(Question, question_id)


def _next_order(db: Session, form_id: str) -> int:
    max_order = db.execute(
        select(func.max(Question.order)).where(Question.form_id == form_id)
    ).scalar()
    return (max_order or -1) + 1


def create_question(db: Session, form: Form, payload: QuestionCreate) -> Question:
    question = Question(
        form_id=form.id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        required=payload.required,
        order=payload.order if payload.order else _next_order(db, form.id),
        settings=payload.settings or {},
    )
    db.add(question)
    db.flush()

    for idx, choice in enumerate(payload.choices):
        db.add(Choice(question_id=question.id, label=choice.label, order=choice.order or idx))

    form.updated_at = _utcnow()
    db.commit()
    db.refresh(question)
    return question


def update_question(db: Session, question: Question, payload: QuestionUpdate) -> Question:
    data = payload.model_dump(exclude_unset=True, exclude={"choices"})
    for key, value in data.items():
        setattr(question, key, value)

    if payload.choices is not None:
        # Full replace-on-save keeps builder logic simple and predictable.
        for existing in list(question.choices):
            db.delete(existing)
        db.flush()
        for idx, choice in enumerate(payload.choices):
            db.add(Choice(question_id=question.id, label=choice.label, order=choice.order or idx))

    question.form.updated_at = _utcnow()
    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question: Question) -> None:
    form = question.form
    db.delete(question)
    db.flush()

    # Re-sequence remaining question orders so there are no gaps.
    remaining = (
        db.execute(select(Question).where(Question.form_id == form.id).order_by(Question.order))
        .scalars()
        .all()
    )
    for idx, q in enumerate(remaining):
        q.order = idx

    form.updated_at = _utcnow()
    db.commit()


def duplicate_question(db: Session, question: Question) -> Question:
    new_question = Question(
        form_id=question.form_id,
        type=question.type,
        title=f"{question.title} (copy)" if question.title else "",
        description=question.description,
        required=question.required,
        order=_next_order(db, question.form_id),
        settings=dict(question.settings or {}),
    )
    db.add(new_question)
    db.flush()

    for choice in sorted(question.choices, key=lambda c: c.order):
        db.add(Choice(question_id=new_question.id, label=choice.label, order=choice.order))

    question.form.updated_at = _utcnow()
    db.commit()
    db.refresh(new_question)
    return new_question


def reorder_questions(db: Session, form: Form, items: list[QuestionReorderItem]) -> None:
    order_map = {item.id: item.order for item in items}
    for question in form.questions:
        if question.id in order_map:
            question.order = order_map[question.id]
    form.updated_at = _utcnow()
    db.commit()
