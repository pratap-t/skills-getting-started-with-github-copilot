import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Basketball" in data

def test_signup_and_unregister():
    # Use a unique email to avoid conflicts
    test_email = "pytestuser@mergington.edu"
    activity = "Basketball"

    # Signup
    signup_resp = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert signup_resp.status_code == 200 or signup_resp.status_code == 400
    # If already signed up, status 400 is expected

    # Unregister
    unregister_resp = client.post(f"/activities/{activity}/unregister?email={test_email}")
    assert unregister_resp.status_code == 200
    assert unregister_resp.json()["success"] is True

    # Unregister again should fail
    unregister_resp2 = client.post(f"/activities/{activity}/unregister?email={test_email}")
    assert unregister_resp2.status_code == 400

@pytest.mark.parametrize("activity", ["Basketball", "Tennis Club", "Drama Club"])
def test_activity_exists(activity):
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert activity in data
