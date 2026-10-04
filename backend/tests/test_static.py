def test_serves_login_page_at_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Sign in" in response.text


def test_serves_nested_page(client):
    response = client.get("/nda/")
    assert response.status_code == 200
    assert "NDA" in response.text
