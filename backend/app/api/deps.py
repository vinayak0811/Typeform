from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.crud.user import get_user_by_id
from app.database.session import get_db
from app.models.user import User

# auto_error=False so we can return our own 401 payload shape (and so an
# optional-auth dependency can reuse this without raising on missing header).
_bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(detail: str = "Not authenticated") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise _unauthorized()

    user_id = decode_token(credentials.credentials, expected_type="access")
    if not user_id:
        raise _unauthorized("Invalid or expired token")

    user = get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise _unauthorized("User not found")

    return user


def require_form_owner(form, current_user: User) -> None:
    """Raise 404 (not 403) if the form isn't owned by current_user, so an
    authenticated stranger can't distinguish 'not yours' from 'doesn't
    exist' by probing IDs."""
    if form.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    """Same as get_current_user but never raises — used by endpoints that
    behave slightly differently for logged-in vs. anonymous callers without
    requiring auth outright."""
    if credentials is None:
        return None
    user_id = decode_token(credentials.credentials, expected_type="access")
    if not user_id:
        return None
    return get_user_by_id(db, user_id)
