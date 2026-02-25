from datetime import datetime
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models import Assignment, Course
import uuid
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class TestAssignmentCreation(APITestCase):
    def setUp(self):
        # Create instructor
        self.instructor = User.objects.create_user(
            username="Test teacher",
            email="teacher@test.com",
            password="pass1234"
        )
        self.client.force_authenticate(self.instructor)

        # Create a course for the assignment to reference
        self.course = Course.objects.create(
            id=uuid.uuid4(),
            grade_level=7,
            period=1,
            course_name="Test Course"
        )

    def test_create_assignment_without_files(self):
        url = reverse("assignment-list")  # /api/assignments/
        due = (timezone.now() + timedelta(hours=24))
        payload = {
            "course_id": str(self.course.id),  
            "type": "Assignment", # Assignment/Quiz/Project
            "title": "Test Title",
            "description": "Test Description",
            "total_score": 20,
            "due": due.isoformat(),
            "rubric": "1. Test rubric 1\n2. Test rubric 2",
            "example_answer": "Test example answer",
            "file_urls": ["https://testacctid.r2.cloudflarestorage.com/grading-sys-files/AssignmentFiles/testfile1.pdf?testencoding1", 
                       "https://testacctid.r2.cloudflarestorage.com/grading-sys-files/AssignmentFiles/testfile2.pdf?testencoding2"]
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, 201)
        assignment = Assignment.objects.get(id=response.data["id"])

        self.assertEqual(assignment.course_id_id, self.course.id)
        self.assertEqual(assignment.type, payload["type"])
        self.assertEqual(assignment.title, payload["title"])
        self.assertEqual(assignment.description, payload["description"])
        self.assertEqual(assignment.total_score, payload["total_score"])
        self.assertEqual(assignment.created_by, self.instructor)
        self.assertTrue(assignment.created_at)
        self.assertEqual(assignment.due, due)
        self.assertEqual(assignment.rubric, payload["rubric"])
        self.assertEqual(assignment.example_answer, payload["example_answer"])
        self.assertEqual(assignment.file_urls, payload["file_urls"])
