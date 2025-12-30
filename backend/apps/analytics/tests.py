import json

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from rest_framework.test import APIClient


class HealthEndpointTests(SimpleTestCase):
    def test_health_returns_ok(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), {"status": "ok"})

    def test_health_non_get_returns_standard_error(self):
        response = self.client.post("/api/health/")

        self.assertEqual(response.status_code, 405)
        self.assertEqual(
            json.loads(response.content),
            {
                "error": {
                    "code": "method_not_allowed",
                    "message": "Method POST not allowed.",
                    "details": None,
                }
            },
        )


class AuthCheckEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_auth_check_logged_out_is_unauthorized(self):
        resp = self.client.get("/api/auth-check/")
        # Depending on DRF config, this can be 401 or 403 (SessionAuth often yields 403).
        self.assertIn(resp.status_code, (401, 403))

    def test_auth_check_logged_in_returns_ok(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password="pass",
        )

        self.client.force_authenticate(user=user)
        resp = self.client.get("/api/auth-check/")

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), {"status": "ok"})
