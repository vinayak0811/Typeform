import math

from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload

from app.models.form import Form
from app.models.response import Response
from app.models.answer import Answer
from app.schemas.response import ResponseSubmit


def create_response(db: Session, form: Form, payload: ResponseSubmit) -> Response:
    response = Response(form_id=form.id, completed=payload.completed)
    db.add(response)
    db.flush()

    for answer in payload.answers:
        db.add(
            Answer(
                response_id=response.id,
                question_id=answer.question_id,
                value_text=answer.value_text,
                value_number=answer.value_number,
                choice_id=answer.choice_id,
            )
        )

    db.commit()
    db.refresh(response)
    return response


def get_response(db: Session, response_id: str) -> Response | None:
    stmt = (
        select(Response)
        .where(Response.id == response_id)
        .options(selectinload(Response.answers))
    )
    return db.execute(stmt).scalar_one_or_none()


def list_responses(
    db: Session,
    form_id: str,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
) -> tuple[list[Response], int]:
    base = select(Response).where(Response.form_id == form_id)

    if search:
        # Match against any free-text answer value in this response.
        base = base.join(Answer, Answer.response_id == Response.id).where(
            Answer.value_text.ilike(f"%{search}%")
        ).distinct()

    total = db.execute(select(func.count()).select_from(base.subquery())).scalar_one()

    stmt = (
        base.order_by(Response.submitted_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = db.execute(stmt).scalars().all()
    return items, total


def paginate_meta(total: int, page: int, page_size: int) -> int:
    return max(1, math.ceil(total / page_size)) if page_size else 1
