from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_form_owner
from app.database.session import get_db
from app.crud import form as form_crud
from app.crud import question as question_crud
from app.models.user import User
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionRead,
    QuestionReorderItem,
)

router = APIRouter(prefix="/api/forms/{form_id}/questions", tags=["questions"])


def _get_owned_form_or_404(db: Session, form_id: str, current_user: User):
    form = form_crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    require_form_owner(form, current_user)
    return form


def _get_question_or_404(db: Session, form_id: str, question_id: str):
    question = question_crud.get_question(db, question_id)
    if not question or question.form_id != form_id:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.post("", response_model=QuestionRead, status_code=201)
def create_question(
    form_id: str,
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    form = _get_owned_form_or_404(db, form_id, current_user)
    return question_crud.create_question(db, form, payload)


@router.patch("/{question_id}", response_model=QuestionRead)
def update_question(
    form_id: str,
    question_id: str,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_form_or_404(db, form_id, current_user)
    question = _get_question_or_404(db, form_id, question_id)
    return question_crud.update_question(db, question, payload)


@router.delete("/{question_id}", status_code=204)
def delete_question(
    form_id: str,
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_form_or_404(db, form_id, current_user)
    question = _get_question_or_404(db, form_id, question_id)
    question_crud.delete_question(db, question)


@router.post("/{question_id}/duplicate", response_model=QuestionRead, status_code=201)
def duplicate_question(
    form_id: str,
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_form_or_404(db, form_id, current_user)
    question = _get_question_or_404(db, form_id, question_id)
    return question_crud.duplicate_question(db, question)


@router.post("/reorder", status_code=204)
def reorder_questions(
    form_id: str,
    items: list[QuestionReorderItem],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    form = _get_owned_form_or_404(db, form_id, current_user)
    question_crud.reorder_questions(db, form, items)
