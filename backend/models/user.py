"""User accounts and their sign-in sessions."""

from datetime import datetime

from pydantic import EmailStr
from pydantic import Field as PydanticField
from sqlmodel import Field, SQLModel

from models.base import CamelModel, utcnow


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=utcnow)


class AuthSession(SQLModel, table=True):
    """A signed-in browser, identified by the random token in its session cookie."""

    __tablename__ = "auth_sessions"

    token: str = Field(primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=utcnow)


class Credentials(CamelModel):
    email: EmailStr
    password: str = PydanticField(min_length=8, max_length=128)


class UserOut(CamelModel):
    id: int
    email: str
