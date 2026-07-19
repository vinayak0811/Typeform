from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.form import Form
from app.models.question import Question
from app.models.choice import Choice
from app.models.response import Response
from app.models.enums import FormStatus
from app.schemas.form import FormCreate, FormUpdate


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_form(db: Session, form_id: str) -> Form | None:
    stmt = (
        select(Form)
        .where(Form.id == form_id)
        .options(selectinload(Form.questions).selectinload(Question.choices))
    )
    return db.execute(stmt).scalar_one_or_none()


def list_forms(
    db: Session,
    owner_id: str,
    search: str | None = None,
    sort_by: str = "updated_at",
    sort_dir: str = "desc",
) -> list[dict]:
    """
    Returns dashboard-ready rows: each form plus its response_count and
    question_count, computed with correlated subqueries so it's a single
    round trip regardless of how many forms exist.
    """
    response_count_sq = (
        select(func.count(Response.id))
        .where(Response.form_id == Form.id)
        .scalar_subquery()
    )
    question_count_sq = (
        select(func.count(Question.id))
        .where(Question.form_id == Form.id)
        .scalar_subquery()
    )

    stmt = select(
        Form, response_count_sq.label("response_count"), question_count_sq.label("question_count")
    ).where(Form.user_id == owner_id)

    if search:
        stmt = stmt.where(Form.title.ilike(f"%{search}%"))

    sort_column = {
        "title": Form.title,
        "created_at": Form.created_at,
        "updated_at": Form.updated_at,
        "status": Form.status,
    }.get(sort_by, Form.updated_at)

    stmt = stmt.order_by(sort_column.desc() if sort_dir == "desc" else sort_column.asc())

    rows = db.execute(stmt).all()
    results = []
    for form, response_count, question_count in rows:
        results.append(
            {
                "id": form.id,
                "title": form.title,
                "description": form.description,
                "status": form.status,
                "created_at": form.created_at,
                "updated_at": form.updated_at,
                "published_at": form.published_at,
                "response_count": response_count or 0,
                "question_count": question_count or 0,
            }
        )
    return results


def create_form(db: Session, payload: FormCreate, owner_id: str) -> Form:
    form = Form(
        title=payload.title or "Untitled Form",
        description=payload.description or "",
        user_id=owner_id,
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


def update_form(db: Session, form: Form, payload: FormUpdate) -> Form:
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(form, key, value)
    form.updated_at = _utcnow()
    db.commit()
    db.refresh(form)
    return form


def delete_form(db: Session, form: Form) -> None:
    db.delete(form)
    db.commit()


def duplicate_form(db: Session, form: Form) -> Form:
    new_form = Form(
        title=f"{form.title} (copy)",
        description=form.description,
        status=FormStatus.DRAFT,
        user_id=form.user_id,
    )
    db.add(new_form)
    db.flush()  # obtain new_form.id before creating children

    for question in sorted(form.questions, key=lambda q: q.order):
        new_question = Question(
            form_id=new_form.id,
            type=question.type,
            title=question.title,
            description=question.description,
            required=question.required,
            order=question.order,
            settings=dict(question.settings or {}),
        )
        db.add(new_question)
        db.flush()

        for choice in sorted(question.choices, key=lambda c: c.order):
            db.add(
                Choice(
                    question_id=new_question.id,
                    label=choice.label,
                    order=choice.order,
                )
            )

    db.commit()
    db.refresh(new_form)
    return new_form


def publish_form(db: Session, form: Form) -> Form:
    form.status = FormStatus.PUBLISHED
    form.published_at = _utcnow()
    form.updated_at = _utcnow()
    db.commit()
    db.refresh(form)
    return form


def unpublish_form(db: Session, form: Form) -> Form:
    form.status = FormStatus.DRAFT
    form.updated_at = _utcnow()
    db.commit()
    db.refresh(form)
    return form
