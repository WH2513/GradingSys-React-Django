from datetime import datetime
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models import Assignment, Course
import uuid
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class TestAssignmentAPI(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Create instructor for test
        cls.instructor = User.objects.create_user(
            username="Test teacher",
            email="teacher@test.com",
            password="pass1234"
        )

        # Create courses for the assignment to reference
        cls.course1 = Course.objects.create(
            id=uuid.uuid4(),
            grade_level=7,
            period=1,
            course_name="Test Course 1"
        )

        cls.course2 = Course.objects.create(
            id=uuid.uuid4(),
            grade_level=8,
            period=2,
            course_name="Test Course 2"
        )

        # Create assignment for test
        cls.assignment = Assignment.objects.create(
            course_id=cls.course1,
            type="Assignment",
            title="Test Assignment",
            description="Test Description",
            total_score=5,
            created_by=cls.instructor,
            due=(timezone.now() + timedelta(hours=24)),
            rubric="1. Test rubric 1\n2. Test rubric 2",
            example_answer="Test example answer",
            file_urls=["https://testacctid.r2.cloudflarestorage.com/grading-sys-files/AssignmentFiles/testfile1.pdf?testencoding1", 
            "https://testacctid.r2.cloudflarestorage.com/grading-sys-files/AssignmentFiles/testfile2.pdf?testencoding2"]

        )

    def setUp(self):
        self.client.force_authenticate(self.instructor)

    def test_create_assignment(self):
        url = reverse("assignment-list")  # /api/assignments/
        due = (timezone.now() + timedelta(hours=24))
        payload = {
            "course_id": str(self.course1.id),  
            "type": "Assignment", # Assignment/Quiz/Project
            "title": "Test Creation Title",
            "description": "Test Creation Description",
            "total_score": 20,
            "due": due.isoformat(),
            "rubric": "1. Test Creation rubric 1\n2. Test Creation rubric 2",
            "example_answer": "Test Creation example answer",
            "file_urls": ["https://testacctid.r2.cloudflarestorage.com/grading-sys-files/AssignmentFiles/testfile1.pdf?test_creation_encoding1", 
                       "https://testacctid.r2.cloudflarestorage.com/grading-sys-files/AssignmentFiles/testfile2.pdf?test_creation_encoding2"]
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, 201)
        assignment = Assignment.objects.get(id=response.data["id"])
        self.assignment = assignment

        self.assertEqual(assignment.course_id_id, self.course1.id)
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

    def test_edit_assignment(self):
        edit_url = reverse("assignment-update", kwargs={"pk": self.assignment.id})
        due = (timezone.now() + timedelta(hours=24))
        updated_payload = {
            "course_id": str(self.course2.id),  # course1 -> course2
            "type": "Quiz", # Assignment -> Quiz
            "title": "Test Title Upd",
            "description": "Test Description Upd",
            "total_score": 10, # 20 -> 10
            "due": due.isoformat(),
            "rubric": "1. Test rubric 1 Upd\n2. Test rubric 2 Upd",
            "example_answer": "Test example answer Upd",
            "file_urls": ["https://testacctid.r2.cloudflarestorage.com/grading-sys-files/AssignmentFiles/testfile1.pdf?test_update_encoding1", 
                       "https://testacctid.r2.cloudflarestorage.com/grading-sys-files/AssignmentFiles/testfile3.pdf?test_update_encoding3"] # change the second file url (remove 2nd, add 3rd)
        }

        response = self.client.put(edit_url, updated_payload, format="json")
        self.assertEqual(response.status_code, 200)
        updated_assignment = Assignment.objects.get(id=self.assignment.id)

        self.assertEqual(updated_assignment.course_id_id, self.course2.id)
        self.assertEqual(updated_assignment.type, updated_payload["type"])
        self.assertEqual(updated_assignment.title, updated_payload["title"])
        self.assertEqual(updated_assignment.description, updated_payload["description"])
        self.assertEqual(updated_assignment.total_score, updated_payload["total_score"])
        self.assertEqual(updated_assignment.created_by, self.instructor)
        self.assertTrue(updated_assignment.created_at)
        self.assertEqual(updated_assignment.due, due)
        self.assertEqual(updated_assignment.rubric, updated_payload["rubric"])
        self.assertEqual(updated_assignment.example_answer, updated_payload["example_answer"])
        self.assertEqual(updated_assignment.file_urls, updated_payload["file_urls"])