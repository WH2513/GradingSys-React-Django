from django.test import TestCase

class BasicMathTest(TestCase):
    def test_basic_math(self):
        self.assertEqual(1 + 1, 2)


class HealthEndpointTest(TestCase):
    def test_health_endpoint(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)