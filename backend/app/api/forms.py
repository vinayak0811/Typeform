from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_form_owner
from app.database.session import get_db
from app.crud import form as form_crud
from app.models.user import User
from app.schemas.form import FormCreate, FormUpdate, FormRead, FormListItem

router = APIRouter(prefix="/api/forms", tags=["forms"])


def _get_owned_form_or_404(db: Session, form_id: str, current_user: User):
    form = form_crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    require_form_owner(form, current_user)
    return form


@router.get("", response_model=list[FormListItem])
def list_forms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = Query(default=None),
    sort_by: str = Query(default="updated_at"),
    sort_dir: str = Query(default="desc"),
):
    return form_crud.list_forms(db, owner_id=current_user.id, search=search, sort_by=sort_by, sort_dir=sort_dir)


@router.post("", response_model=FormRead, status_code=201)
def create_form(payload: FormCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = form_crud.create_form(db, payload, owner_id=current_user.id)
    return form_crud.get_form(db, form.id)


@router.get("/{form_id}", response_model=FormRead)
def get_form(form_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_owned_form_or_404(db, form_id, current_user)


@router.patch("/{form_id}", response_model=FormRead)
def update_form(
    form_id: str,
    payload: FormUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    form = _get_owned_form_or_404(db, form_id, current_user)
    form_crud.update_form(db, form, payload)
    return form_crud.get_form(db, form_id)


@router.delete("/{form_id}", status_code=204)
def delete_form(form_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = _get_owned_form_or_404(db, form_id, current_user)
    form_crud.delete_form(db, form)


@router.post("/{form_id}/duplicate", response_model=FormRead, status_code=201)
def duplicate_form(form_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = _get_owned_form_or_404(db, form_id, current_user)
    new_form = form_crud.duplicate_form(db, form)
    return form_crud.get_form(db, new_form.id)


@router.post("/{form_id}/publish", response_model=FormRead)
def publish_form(form_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = _get_owned_form_or_404(db, form_id, current_user)
    if not form.questions:
        raise HTTPException(status_code=400, detail="Add at least one question before publishing.")
    form_crud.publish_form(db, form)
    return form_crud.get_form(db, form_id)


@router.post("/{form_id}/unpublish", response_model=FormRead)
def unpublish_form(form_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = _get_owned_form_or_404(db, form_id, current_user)
    form_crud.unpublish_form(db, form)
    return form_crud.get_form(db, form_id)
