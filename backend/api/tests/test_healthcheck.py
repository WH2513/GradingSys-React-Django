from django.test import TestCase

class TestBasicMath(TestCase):
    def test_basic_math(self):
        self.assertEqual(1 + 1, 2)


class TestHealthEndpoint(TestCase):
    def test_health_endpoint(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)