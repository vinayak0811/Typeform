from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.crud import form as form_crud
from app.crud import response as response_crud
from app.models.enums import FormStatus
from app.schemas.form import FormPublicRead
from app.schemas.response import ResponseSubmit, ResponseRead
from app.services.validation_service import validate_submission, ValidationError

router = APIRouter(prefix="/api/public/forms", tags=["public"])


@router.get("/{form_id}", response_model=FormPublicRead)
def get_public_form(form_id: str, db: Session = Depends(get_db)):
    form = form_crud.get_form(db, form_id)
    if not form or form.status != FormStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="This form is not available.")
    return form


@router.post("/{form_id}/responses", response_model=ResponseRead, status_code=201)
def submit_response(form_id: str, payload: ResponseSubmit, db: Session = Depends(get_db)):
    form = form_crud.get_form(db, form_id)
    if not form or form.status != FormStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="This form is not available.")

    try:
        validate_submission(form, payload)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail={"message": "Validation failed", "errors": e.errors})

    return response_crud.create_response(db, form, payload)
