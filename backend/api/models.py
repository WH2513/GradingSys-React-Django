from django.db import models
from django.db.models import UniqueConstraint
from django.contrib.auth.models import User
import uuid

# Data models
class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grade_level = models.IntegerField()
    period = models.IntegerField()
    course_name = models.CharField(max_length=100)
    # students = models.ManyToManyField(Student, related_name='as_courses')

    class Meta:
        constraints = [
            UniqueConstraint(fields=['grade_level', 'course_name'], name='course')
        ]

    def __str__(self):
        return '[Course]G' + str(self.grade_level) + '_' + self.course_name

class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    grade_level = models.IntegerField()
    # courses = models.ManyToManyField(Course, related_name='students')

    def __str__(self):
        return '[Student]G' + str(self.grade_level) + '_' + self.name + '_' + str(self.id)

class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    type = models.CharField(max_length=50)
    title = models.TextField()
    description = models.TextField()
    total_score = models.IntegerField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments')
    created_at = models.DateTimeField(auto_now_add=True)
    due =  models.DateTimeField()
    files = models.TextField() # Todo: change to file path

    def __str__(self):
        return '[Assignment]' + self.title
    
# bridge table that links students and courses (many-to-many)
class StudentCourse(models.Model):
    student_id = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='courses')
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='students')

    class Meta:
        constraints = [
            UniqueConstraint(fields=['student_id', 'course_id'], name='student_course')
        ]
    
    def __str__(self):
        return '[Student-Course]' + str(self.student_id) + '-' + str(self.course_id)

class submission(models.Model):
    assignment_id = models.ForeignKey(Assignment, on_delete=models.PROTECT, related_name='submissions')
    content = models.TextField()
    files = models.TextField() # Todo: change to file path
    STATUS_CHOICES = [
        ('turned_in', 'Turned in'),
        ('missing', 'Missing'),
        ('late', 'Late'),
        ('not_due_yet', 'Not due yet'),
    ]

    status = models.CharField(
        max_length=11,
        choices=STATUS_CHOICES,
        default='not_due_yet',
    )

    def __str__(self):
        return '[Submisstion]' + self.assignment_id + '-' + self.status

class grade(models.Model):
    student_id = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    assignment_id = models.ForeignKey(Assignment, on_delete=models.PROTECT, related_name='grade')
    score = models.IntegerField()

    def __str__(self):
        return '[Grade]SID:' + self.student_id + ' CourseID:' + self.course_id + ' AssignmentID:' + self.assignment_id + ' Score:' + self.score
