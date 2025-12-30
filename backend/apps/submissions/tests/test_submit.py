from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from apps.submissions.models import Submission


class TestSubmissions(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _payload(self, **overrides):
        base = {
            "kind": "contact",
            "name": "Carmelo",
            "email": "carmelo@example.com",
            "subject": "Hello",
            "message": "Test message",
            "page_url": "https://example.com/contact",
            "turnstile_token": "token",
            "honeypot": "",
        }
        base.update(overrides)
        return base

    @patch("apps.submissions.views.verify_turnstile")
    @patch("apps.submissions.views.os.getenv")
    def test_create_submission_ok(self, mock_getenv, mock_verify):
        mock_getenv.side_effect = lambda name, default="": "test-secret" if name == "TURNSTILE_SECRET_KEY" else default
        mock_verify.return_value = type("R", (), {"success": True, "error_codes": []})()

        resp = self.client.post("/api/submissions/", self._payload(), format="json", REMOTE_ADDR="1.2.3.4")
        assert resp.status_code == 201
        assert Submission.objects.count() == 1

    @patch("apps.submissions.views.verify_turnstile")
    @patch("apps.submissions.views.os.getenv")
    def test_cooldown_blocks_second_submit_same_ip(self, mock_getenv, mock_verify):
        mock_getenv.side_effect = lambda name, default="": "test-secret" if name == "TURNSTILE_SECRET_KEY" else default
        mock_verify.return_value = type("R", (), {"success": True, "error_codes": []})()

        resp1 = self.client.post("/api/submissions/", self._payload(), format="json", REMOTE_ADDR="1.2.3.4")
        assert resp1.status_code == 201

        resp2 = self.client.post("/api/submissions/", self._payload(), format="json", REMOTE_ADDR="1.2.3.4")
        assert resp2.status_code == 429
        assert resp2.data["detail"] == "COOLDOWN"

    @patch("apps.submissions.views.verify_turnstile")
    @patch("apps.submissions.views.os.getenv")
    def test_dedupe_blocks_same_content_different_ip(self, mock_getenv, mock_verify):
        mock_getenv.side_effect = lambda name, default="": "test-secret" if name == "TURNSTILE_SECRET_KEY" else default
        mock_verify.return_value = type("R", (), {"success": True, "error_codes": []})()

        resp1 = self.client.post("/api/submissions/", self._payload(), format="json", REMOTE_ADDR="1.2.3.4")
        assert resp1.status_code == 201

        # different IP so cooldown doesn't trigger; dedupe should
        resp2 = self.client.post("/api/submissions/", self._payload(), format="json", REMOTE_ADDR="5.6.7.8")
        assert resp2.status_code == 409
        assert resp2.data["detail"] == "DUPLICATE_SUBMISSION"

    @patch("apps.submissions.views.verify_turnstile")
    @patch("apps.submissions.views.os.getenv")
    def test_honeypot_drops_request(self, mock_getenv, mock_verify):
        mock_getenv.side_effect = lambda name, default="": "test-secret" if name == "TURNSTILE_SECRET_KEY" else default
        mock_verify.return_value = type("R", (), {"success": True, "error_codes": []})()

        resp = self.client.post(
            "/api/submissions/",
            {
                "kind": "feedback",
                "message": "spam",
                "turnstile_token": "token",
                "honeypot": "i am a bot",
            },
            format="json",
            REMOTE_ADDR="1.2.3.4",
        )
        assert resp.status_code == 204
        assert Submission.objects.count() == 0

    @patch("apps.submissions.views.verify_turnstile")
    @patch("apps.submissions.views.os.getenv")
    def test_feedback_allows_missing_name_email(self, mock_getenv, mock_verify):
        mock_getenv.side_effect = lambda name, default="": "test-secret" if name == "TURNSTILE_SECRET_KEY" else default
        mock_verify.return_value = type("R", (), {"success": True, "error_codes": []})()

        payload = {
            "kind": "feedback",
            "message": "hi",
            "turnstile_token": "token",
            "honeypot": "",
        }
        resp = self.client.post("/api/submissions/", payload, format="json", REMOTE_ADDR="1.2.3.4")
        assert resp.status_code == 201
