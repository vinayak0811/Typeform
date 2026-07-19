"""
Password hashing + JWT issuing/verification.

Two token types are minted, both signed with the same secret:
  - "access"  — short-lived, sent in the Authorization header on every request.
  - "refresh" — longer-lived, stored only in an httpOnly cookie, used solely
                to mint new access tokens via POST /api/auth/refresh.

A third short-lived "reset" token type is used for the forgot/reset password
flow. Tokens are stateless JWTs (no server-side session store), which keeps
things simple for a project like this — see README for the production
caveat (token revocation / rotation).
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TokenType = Literal["access", "refresh", "reset"]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _create_token(subject: str, token_type: TokenType, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str) -> str:
    return _create_token(
        user_id, "access", timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )


def create_refresh_token(user_id: str) -> str:
    return _create_token(
        user_id, "refresh", timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )


def create_reset_token(user_id: str) -> str:
    return _create_token(
        user_id, "reset", timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
    )


def decode_token(token: str, expected_type: TokenType) -> str | None:
    """Returns the subject (user id) if the token is valid, well-formed, and
    of the expected type. Returns None on any failure — callers turn that
    into a 401, never a 500."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None

    if payload.get("type") != expected_type:
        return None

    return payload.get("sub")
