from fastapi import APIRouter, HTTPException, Request

from api.deps import CurrentUser, DbSession
from models.draft import Draft, DraftIn, DraftOut, DraftSummary
from services import drafts

router = APIRouter(prefix="/api/drafts")


def _check_document(request: Request, body: DraftIn) -> None:
    if body.document_id not in request.app.state.documents:
        raise HTTPException(status_code=422, detail=f"Unknown document: {body.document_id}")


def _owned(db: DbSession, user: CurrentUser, draft_id: int) -> Draft:
    draft = drafts.get_draft(db, user, draft_id)
    if draft is None:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft


@router.get("")
def list_drafts(db: DbSession, user: CurrentUser) -> list[DraftSummary]:
    """The signed-in user's drafts, most recent first."""
    return drafts.list_drafts(db, user)


@router.post("", status_code=201)
def create_draft(body: DraftIn, request: Request, db: DbSession, user: CurrentUser) -> DraftOut:
    _check_document(request, body)
    return drafts.create_draft(db, user, body)


@router.get("/{draft_id}")
def get_draft(draft_id: int, db: DbSession, user: CurrentUser) -> DraftOut:
    return _owned(db, user, draft_id)


@router.put("/{draft_id}")
def update_draft(draft_id: int, body: DraftIn, request: Request, db: DbSession, user: CurrentUser) -> DraftOut:
    _check_document(request, body)
    return drafts.update_draft(db, _owned(db, user, draft_id), body)
