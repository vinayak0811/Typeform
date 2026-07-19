from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_form_owner
from app.database.session import get_db
from app.crud import form as form_crud
from app.crud import response as response_crud
from app.models.user import User
from app.schemas.response import ResponseRead, PaginatedResponses

router = APIRouter(prefix="/api/forms/{form_id}/responses", tags=["responses"])


@router.get("", response_model=PaginatedResponses)
def list_responses(
    form_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    form = form_crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    require_form_owner(form, current_user)

    items, total = response_crud.list_responses(db, form_id, page=page, page_size=page_size, search=search)
    return PaginatedResponses(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=response_crud.paginate_meta(total, page, page_size),
    )


@router.get("/{response_id}", response_model=ResponseRead)
def get_response(
    form_id: str,
    response_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    form = form_crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    require_form_owner(form, current_user)

    response = response_crud.get_response(db, response_id)
    if not response or response.form_id != form_id:
        raise HTTPException(status_code=404, detail="Response not found")
    return response
