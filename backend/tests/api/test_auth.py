def signup(client, password, email="ann@example.com"):
    return client.post("/api/auth/signup", json={"email": email, "password": password})


def test_signup_signs_in_with_http_only_cookie(client, password):
    response = signup(client, password)
    assert response.status_code == 201
    assert response.json() == {"id": 1, "email": "ann@example.com"}
    cookie = response.headers["set-cookie"]
    assert "prelegal_session=" in cookie and "HttpOnly" in cookie and "SameSite=lax" in cookie
    assert "Max-Age=2592000" in cookie
    assert client.get("/api/auth/me").json()["email"] == "ann@example.com"


def test_signup_validates_input(client, password):
    assert signup(client, password, email="not-an-email").status_code == 422
    assert signup(client, "short").status_code == 422
    assert signup(client, "x" * 129).status_code == 422


def test_signup_rejects_taken_email(client, password):
    signup(client, password)
    assert signup(client, password, email="ANN@example.com").status_code == 409


def test_signin_and_signout(client, password):
    signup(client, password)
    client.post("/api/auth/signout")
    assert client.get("/api/auth/me").status_code == 401

    wrong = {"email": "ann@example.com", "password": "wrong password"}
    assert client.post("/api/auth/signin", json=wrong).status_code == 401
    response = client.post("/api/auth/signin", json={"email": "ann@example.com", "password": password})
    assert response.status_code == 200
    assert client.get("/api/auth/me").status_code == 200


def test_signout_revokes_the_session_token(client, password):
    token = signup(client, password).cookies["prelegal_session"]
    client.post("/api/auth/signout")
    client.cookies.set("prelegal_session", token)
    assert client.get("/api/auth/me").status_code == 401
