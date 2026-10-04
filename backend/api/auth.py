from fastapi import APIRouter, HTTPException, Response

from api.deps import SESSION_COOKIE, CurrentUser, DbSession, SessionToken
from models.user import Credentials, User, UserOut
from services import auth

router = APIRouter(prefix="/api/auth")


def _sign_in(response: Response, db: DbSession, user: User) -> User:
    # HttpOnly keeps the token away from JavaScript; Lax blocks cross-site POSTs.
    token = auth.start_session(db, user)
    # Persists across browser restarts for the session lifetime; signing out revokes it server-side.
    max_age = int(auth.SESSION_LIFETIME.total_seconds())
    response.set_cookie(SESSION_COOKIE, token, max_age=max_age, httponly=True, samesite="lax")
    return user


@router.post("/signup", status_code=201)
def signup(body: Credentials, response: Response, db: DbSession) -> UserOut:
    """Create an account and sign in."""
    try:
        user = auth.sign_up(db, body.email, body.password)
    except auth.EmailTaken:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    return _sign_in(response, db, user)


@router.post("/signin")
def signin(body: Credentials, response: Response, db: DbSession) -> UserOut:
    user = auth.authenticate(db, body.email, body.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return _sign_in(response, db, user)


@router.post("/signout", status_code=204)
def signout(response: Response, db: DbSession, token: SessionToken = None) -> None:
    if token:
        auth.end_session(db, token)
    response.delete_cookie(SESSION_COOKIE)


@router.get("/me")
def me(user: CurrentUser) -> UserOut:
    return user
