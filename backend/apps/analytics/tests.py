import json

from django.test import SimpleTestCase

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
