def test_pages_must_be_revalidated(client):
    for path in ("/", "/draft/"):
        assert client.get(path).headers["cache-control"] == "no-cache"


def test_not_modified_page_keeps_no_cache(client):
    etag = client.get("/").headers["etag"]
    response = client.get("/", headers={"If-None-Match": etag})
    assert response.status_code == 304
    assert response.headers["cache-control"] == "no-cache"


def test_assets_keep_default_caching(client):
    response = client.get("/_next/static/app.js")
    assert response.status_code == 200
    assert "cache-control" not in response.headers
