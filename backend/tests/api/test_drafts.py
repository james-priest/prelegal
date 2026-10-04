DRAFT = {
    "documentId": "mutual-nda",
    "fields": {"purpose": "Joint venture"},
    "parties": {"party1": {"company": "Acme Inc", "name": "", "title": "", "noticeAddress": ""}},
    "messages": [{"role": "user", "content": "An NDA please"}],
}


def test_drafts_require_sign_in(client):
    assert client.get("/api/drafts").status_code == 401
    assert client.post("/api/drafts", json=DRAFT).status_code == 401


def test_create_get_update_and_list(signed_in):
    created = signed_in.post("/api/drafts", json=DRAFT)
    assert created.status_code == 201
    draft = created.json()
    assert draft["documentId"] == "mutual-nda"
    assert draft["updatedAt"].endswith("Z") or draft["updatedAt"].endswith("+00:00")

    updated = signed_in.put(f"/api/drafts/{draft['id']}", json={**DRAFT, "fields": {"purpose": "Acquisition"}})
    assert updated.json()["fields"] == {"purpose": "Acquisition"}
    assert signed_in.get(f"/api/drafts/{draft['id']}").json()["messages"] == DRAFT["messages"]

    [summary] = signed_in.get("/api/drafts").json()
    assert summary["id"] == draft["id"]
    assert summary["parties"]["party1"]["company"] == "Acme Inc"
    assert "messages" not in summary


def test_rejects_unknown_document(signed_in):
    assert signed_in.post("/api/drafts", json={**DRAFT, "documentId": "employment-contract"}).status_code == 422


def test_other_users_drafts_are_not_found(signed_in, password):
    draft_id = signed_in.post("/api/drafts", json=DRAFT).json()["id"]
    signed_in.post("/api/auth/signout")
    signed_in.post("/api/auth/signup", json={"email": "bob@example.com", "password": password})
    assert signed_in.get(f"/api/drafts/{draft_id}").status_code == 404
    assert signed_in.put(f"/api/drafts/{draft_id}", json=DRAFT).status_code == 404
    assert signed_in.get("/api/drafts").json() == []
