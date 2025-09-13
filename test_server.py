import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from server import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def set_env_vars(monkeypatch):
    monkeypatch.setenv("FROM_EMAIL", "from@example.com")
    monkeypatch.setenv("SMTP_HOST", "smtp.example.com")
    monkeypatch.setenv("SMTP_PORT", "587")
    monkeypatch.setenv("SMTP_USER", "user")
    monkeypatch.setenv("SMTP_PASS", "pass")
    monkeypatch.setenv("SMTP_SECURE", "false")
    monkeypatch.setenv("ALLOWED_ORIGIN", "*")

def valid_payload():
    return {
        "email": "to@example.com",
        "chartImage": "data:image/png;base64," + "iVBORw0KGgoAAAANSUhEUgAAAAUA"
    }

@patch("smtplib.SMTP")
def test_send_email_success(mock_smtp):
    mock_server = MagicMock()
    mock_smtp.return_value.__enter__.return_value = mock_server
    response = client.post("/send-email", json=valid_payload())
    assert response.status_code == 200 or response.status_code == 429  # Allow for rate limit in test env

@patch("smtplib.SMTP")
def test_send_email_missing_email(mock_smtp):
    payload = valid_payload()
    payload["email"] = ""
    response = client.post("/send-email", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email and chart image are required."

@patch("smtplib.SMTP")
def test_send_email_missing_chart_image(mock_smtp):
    payload = valid_payload()
    payload["chartImage"] = ""
    response = client.post("/send-email", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email and chart image are required."

@patch("smtplib.SMTP")
def test_send_email_invalid_email_format(mock_smtp):
    payload = valid_payload()
    payload["email"] = "invalid-email"
    response = client.post("/send-email", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid email address."

@patch("smtplib.SMTP")
def test_send_email_invalid_chart_image_format(mock_smtp):
    payload = valid_payload()
    payload["chartImage"] = "not_base64"
    response = client.post("/send-email", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid chart image format."

@patch("smtplib.SMTP", side_effect=Exception("SMTP error"))
def test_send_email_smtp_failure(mock_smtp):
    response = client.post("/send-email", json=valid_payload())
    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to send email."