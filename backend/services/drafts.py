"""A user's saved drafts. Every query is scoped to the owner."""

from sqlmodel import Session, col, select

from models.base import utcnow
from models.draft import Draft, DraftIn
from models.user import User


def list_drafts(db: Session, user: User) -> list[Draft]:
    """The user's drafts, most recently updated first."""
    statement = select(Draft).where(Draft.user_id == user.id).order_by(col(Draft.updated_at).desc())
    return list(db.exec(statement))


def get_draft(db: Session, user: User, draft_id: int) -> Draft | None:
    """The draft if it exists and belongs to `user`."""
    draft = db.get(Draft, draft_id)
    return draft if draft and draft.user_id == user.id else None


def update_draft(db: Session, draft: Draft, data: DraftIn) -> Draft:
    """Replace the draft's content with `data` and save it."""
    draft.document_id = data.document_id
    draft.fields = data.fields
    draft.parties = {key: party.model_dump(by_alias=True) for key, party in data.parties.items()}
    draft.messages = [message.model_dump() for message in data.messages]
    draft.updated_at = utcnow()
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


def create_draft(db: Session, user: User, data: DraftIn) -> Draft:
    return update_draft(db, Draft(user_id=user.id, document_id=data.document_id), data)
