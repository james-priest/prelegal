"""Sign up, sign in and session tokens."""

import secrets
from datetime import UTC, timedelta

from pwdlib import PasswordHash
from sqlmodel import Session, select

from models.base import utcnow
from models.user import AuthSession, User

password_hash = PasswordHash.recommended()

SESSION_LIFETIME = timedelta(days=30)


class EmailTaken(Exception):
    """Raised when signing up with an email that already has an account."""


def _normalize(email: str) -> str:
    return email.strip().lower()


def sign_up(db: Session, email: str, password: str) -> User:
    """Create an account; raises EmailTaken if the email is registered."""
    email = _normalize(email)
    if db.exec(select(User).where(User.email == email)).first():
        raise EmailTaken(email)
    user = User(email=email, password_hash=password_hash.hash(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    """The user with these credentials, or None."""
    user = db.exec(select(User).where(User.email == _normalize(email))).first()
    if user and password_hash.verify(password, user.password_hash):
        return user
    return None


def start_session(db: Session, user: User) -> str:
    """Create a session for `user` and return its token."""
    token = secrets.token_urlsafe(32)
    db.add(AuthSession(token=token, user_id=user.id))
    db.commit()
    return token


def user_for_token(db: Session, token: str) -> User | None:
    """The signed-in user for a session token, or None if the session doesn't exist or has expired."""
    session = db.get(AuthSession, token)
    if session is None:
        return None
    # SQLite returns naive datetimes; they are stored in UTC.
    if session.created_at.replace(tzinfo=UTC) + SESSION_LIFETIME < utcnow():
        end_session(db, token)
        return None
    return db.get(User, session.user_id)


def end_session(db: Session, token: str) -> None:
    session = db.get(AuthSession, token)
    if session:
        db.delete(session)
        db.commit()
