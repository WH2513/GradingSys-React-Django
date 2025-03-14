from uuid import UUID
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import (UserSerializer, CourseSerializer, AssignmentSerializer, \
    CourseStudentsSerializer, SubmissionSerializer, SubmissionDetailSerializer, SubmissionUpdateSerializer)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Assignment, Course, Submission

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class AssignmentListCreate(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    # permission_classes = [AllowAny]

    def get_queryset(self):
        cur_user = self.request.user
        return Assignment.objects.filter(created_by=cur_user)
    
    # Manually set created_by as current user, since the model set it as read-only
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)

class AssignmentDelete(generics.DestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cur_user = self.request.user
        return Assignment.objects.filter(created_by=cur_user)
    
class GetCourses(generics.ListAPIView):
    serializer_class = CourseSerializer

    def get_queryset(self):
        allCourses = Course.objects.all().order_by('grade_level', 'period')
        return allCourses
    
class GetCourseStudents(generics.ListAPIView):
    serializer_class = CourseStudentsSerializer

    def get_queryset(self):
        courseId = self.request.get_full_path().split('/')[-2]
        course = Course.objects.get(id=UUID(courseId))
        courseStudents = course.student_set.all()
        
        return courseStudents
    
class GetSubmission(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    
    def get_queryset(self):
        assignmenId = self.kwargs.get('assignment_id')
        studentId = self.kwargs.get('student_id')
        submission = Submission.objects.filter(assignment_id=assignmenId, student_id=studentId)
        return submission

class GetSubmissionDetail(generics.RetrieveAPIView):
    serializer_class = SubmissionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        submission = Submission.objects.filter(pk=pk).select_related('assignment_id', 'student_id')
        return submission

class GradeSubmission(generics.UpdateAPIView):
    serializer_class = SubmissionUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.all()
    
class SubmissionCreate(generics.CreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    # permission_classes = [AllowAny]

    def get_queryset(self):
        return Submission.objects.all()