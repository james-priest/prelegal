"""Shared request dependencies: a database session and the signed-in user."""

from collections.abc import Iterator
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Request
from sqlmodel import Session

from models.user import User
from services import auth

SESSION_COOKIE = "prelegal_session"


def get_db(request: Request) -> Iterator[Session]:
    with Session(request.app.state.engine) as session:
        yield session


DbSession = Annotated[Session, Depends(get_db)]
SessionToken = Annotated[str | None, Cookie(alias=SESSION_COOKIE)]


def current_user(db: DbSession, token: SessionToken = None) -> User:
    """The signed-in user; 401 without a valid session cookie."""
    user = auth.user_for_token(db, token) if token else None
    if user is None:
        raise HTTPException(status_code=401, detail="Not signed in")
    return user


CurrentUser = Annotated[User, Depends(current_user)]
