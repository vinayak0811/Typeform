from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_form_owner
from app.database.session import get_db
from app.crud import form as form_crud
from app.models.user import User
from app.schemas.analytics import FormAnalytics
from app.services.analytics_service import compute_form_analytics

router = APIRouter(prefix="/api/forms/{form_id}/analytics", tags=["analytics"])


@router.get("", response_model=FormAnalytics)
def get_form_analytics(
    form_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    form = form_crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    require_form_owner(form, current_user)
    return compute_form_analytics(db, form)
