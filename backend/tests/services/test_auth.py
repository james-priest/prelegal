from datetime import timedelta

import pytest

from models.base import utcnow
from models.user import AuthSession
from services import auth


def test_sign_up_hashes_password_and_normalizes_email(db):
    user = auth.sign_up(db, " Ann@Example.com ", "correct horse")
    assert user.email == "ann@example.com"
    assert user.password_hash != "correct horse"
    assert auth.password_hash.verify("correct horse", user.password_hash)


def test_sign_up_rejects_taken_email(db):
    auth.sign_up(db, "ann@example.com", "correct horse")
    with pytest.raises(auth.EmailTaken):
        auth.sign_up(db, "ANN@example.com", "another password")


def test_authenticate(db):
    user = auth.sign_up(db, "ann@example.com", "correct horse")
    assert auth.authenticate(db, "Ann@example.com", "correct horse") == user
    assert auth.authenticate(db, "ann@example.com", "wrong password") is None
    assert auth.authenticate(db, "bob@example.com", "correct horse") is None


def test_sessions(db):
    user = auth.sign_up(db, "ann@example.com", "correct horse")
    token = auth.start_session(db, user)
    assert auth.user_for_token(db, token) == user
    auth.end_session(db, token)
    assert auth.user_for_token(db, token) is None
    assert auth.user_for_token(db, "made-up") is None


def test_expired_sessions_are_rejected_and_removed(db):
    user = auth.sign_up(db, "ann@example.com", "correct horse")
    token = auth.start_session(db, user)
    session = db.get(AuthSession, token)
    session.created_at = utcnow() - auth.SESSION_LIFETIME - timedelta(minutes=1)
    db.add(session)
    db.commit()
    assert auth.user_for_token(db, token) is None
    assert db.get(AuthSession, token) is None
