from uuid import UUID
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import (UserSerializer, CourseSerializer, AssignmentSerializer, \
    CourseStudentsSerializer, SubmissionSerializer, SubmissionDetailSerializer, SubmissionUpdateSerializer)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Assignment, Course, Submission
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.response import Response

from django.http import HttpResponse
from django.urls import get_resolver

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        refresh_token = data.get("refresh")
        # access_token = data.get("access")

        # Remove refresh token from JSON response
        response.data.pop("refresh", None)

        # Set HttpOnly cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,        # True in production (HTTPS)
            samesite="None",    # Required for cross-site cookies
            max_age=60 * 60 * 24 * 7,  # 7 days
        )

        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token is None:
            return Response({"detail": "Refresh token missing"}, status=400)

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)

        access_token = serializer.validated_data["access"]

        return Response({"access": access_token})

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class GetUserWithGroupsView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'

    def get_object(self):
        queryset = self.get_queryset()
        lookup_value = self.kwargs[self.lookup_field]
        return queryset.get(**{self.lookup_field: lookup_value})


    def get_queryset(self):
        username = self.kwargs.get('username')
        password = self.kwargs.get('password')
        # user = User.objects.get(username=username, password=password).groups.all()
        user = User.objects.filter(username=username, password=password).select_related('groups')
        # submission = Submission.objects.filter(pk=pk).select_related('assignment_id', 'student_id')
        # groups = User.objects.get(username=username).groups.all()
        return user

class AssignmentListCreate(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    # permission_classes = [AllowAny]

    def get_queryset(self):
        cur_user = self.request.user
        return Assignment.objects.filter(created_by=cur_user)
    
    # Manually set created_by as current user, since the model set it as read-only
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("VALIDATION ERRORS:", serializer.errors)
            return Response(serializer.errors, status=400)
        return super().create(request, *args, **kwargs)


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
        course_id = self.kwargs["course_id"]
        course = Course.objects.get(id=course_id)
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