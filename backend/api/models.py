from django.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.
class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # grade_level = models.IntegerField()
    # course_name = models.CharField(max_length=100)
    # period = models.IntegerField()
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE)
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
    
class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grade_level = models.IntegerField()
    course_name = models.CharField(max_length=100)
    period = models.IntegerField()

    class Meta:
        constraints = [
            UniqueConstraint(fields=['grade_level', 'course_name'], name='course')
        ]

    def __str__(self):
        return '[Course]G' + self.grade_level + '_' + self.course_name
    
class Student(models.Model):
    id = models.AutoField()
    name = models.CharField(max_length=200)
    grade_level = models.IntegerField()

    def __str__(self):
        return '[Student]G' + self.grade_level + '_' + self.name + '_' + self.id  

# bridge table that links students and courses (many-to-many)
class StudentCourse(models.Model):
    student_id = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['student_id', 'course_id'], name='student_course')
        ]
    
    def __str__(self):
        return '[Student-Course]' + self.student_id + '-' + self.course_id

class submission(models.Model):
    assignment_id = models.ForeignKey(Assignment)
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
    student_id = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE)
    assignment_id = models.ForeignKey(Assignment)
    score = models.IntegerField()

    def __str__(self):
        return '[Grade]SID:' + self.student_id + ' CourseID:' + self.course_id + ' AssignmentID:' + self.assignment_id + ' Score:' + self.score
