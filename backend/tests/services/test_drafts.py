from models.draft import DraftIn
from services import auth, drafts


def draft_in(**overrides) -> DraftIn:
    data = {
        "documentId": "mutual-nda",
        "fields": {"purpose": "Joint venture"},
        "parties": {"party1": {"company": "Acme Inc"}},
        "messages": [{"role": "user", "content": "An NDA please"}],
        **overrides,
    }
    return DraftIn.model_validate(data)


def test_create_and_get(db):
    ann = auth.sign_up(db, "ann@example.com", "correct horse")
    draft = drafts.create_draft(db, ann, draft_in())
    loaded = drafts.get_draft(db, ann, draft.id)
    assert loaded.fields == {"purpose": "Joint venture"}
    assert loaded.parties["party1"]["company"] == "Acme Inc"
    assert loaded.messages == [{"role": "user", "content": "An NDA please"}]


def test_drafts_are_private(db):
    ann = auth.sign_up(db, "ann@example.com", "correct horse")
    bob = auth.sign_up(db, "bob@example.com", "correct horse")
    draft = drafts.create_draft(db, ann, draft_in())
    assert drafts.get_draft(db, bob, draft.id) is None
    assert drafts.list_drafts(db, bob) == []


def test_update_replaces_content_and_bumps_updated_at(db):
    ann = auth.sign_up(db, "ann@example.com", "correct horse")
    draft = drafts.create_draft(db, ann, draft_in())
    created = draft.updated_at
    updated = drafts.update_draft(db, draft, draft_in(documentId="pilot-agreement", fields={"pilotPeriod": "60 days"}))
    assert updated.document_id == "pilot-agreement"
    assert updated.fields == {"pilotPeriod": "60 days"}
    assert updated.updated_at > created


def test_list_is_most_recent_first(db):
    ann = auth.sign_up(db, "ann@example.com", "correct horse")
    first = drafts.create_draft(db, ann, draft_in())
    second = drafts.create_draft(db, ann, draft_in())
    drafts.update_draft(db, first, draft_in())
    assert [d.id for d in drafts.list_drafts(db, ann)] == [first.id, second.id]
