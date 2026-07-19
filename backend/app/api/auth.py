from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
)
from app.crud import user as user_crud
from app.database.session import get_db
from app.models.user import User
from app.services.onboarding import create_starter_forms
from app.schemas.auth import (
    AccessTokenResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    UserCreate,
    UserLogin,
    UserRead,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

_REFRESH_COOKIE_PATH = "/api/auth"


def _set_refresh_cookie(response: Response, user_id: str) -> None:
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        path=_REFRESH_COOKIE_PATH,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )


def _issue_tokens(response: Response, user: User) -> AccessTokenResponse:
    _set_refresh_cookie(response, user.id)
    return AccessTokenResponse(
        access_token=create_access_token(user.id),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserRead.model_validate(user),
    )


@router.post("/register", response_model=AccessTokenResponse, status_code=201)
def register(payload: UserCreate, response: Response, db: Session = Depends(get_db)):
    if user_crud.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = user_crud.create_user(db, payload)
    create_starter_forms(db, user.id)
    return _issue_tokens(response, user)


@router.post("/login", response_model=AccessTokenResponse)
def login(payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = user_crud.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return _issue_tokens(response, user)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    user_id = decode_token(token, expected_type="refresh")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = user_crud.get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    # Rotate the refresh token on every use so a leaked cookie has a short
    # useful lifetime — this is the cheap half of refresh-token rotation
    # (no server-side revocation store, but see README for that caveat).
    return _issue_tokens(response, user)


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie(key=settings.REFRESH_TOKEN_COOKIE_NAME, path=_REFRESH_COOKIE_PATH)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, payload.email)

    # Always return the same message whether or not the account exists —
    # otherwise this endpoint becomes an email-enumeration oracle.
    generic_message = "If an account with that email exists, a reset link has been sent."

    if not user:
        return ForgotPasswordResponse(message=generic_message)

    reset_token = create_reset_token(user.id)

    # This project has no email provider configured, so there is nowhere to
    # actually deliver the reset link. In dev/local we hand the token back
    # directly so the flow is testable end-to-end; in production this must
    # be replaced with sending `reset_token` via a transactional email and
    # dropping it from the response entirely.
    debug_token = reset_token if settings.ENV != "production" else None
    return ForgotPasswordResponse(message=generic_message, debug_reset_token=debug_token)


@router.post("/reset-password", status_code=204)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user_id = decode_token(payload.token, expected_type="reset")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user_crud.set_password(db, user, payload.new_password)
