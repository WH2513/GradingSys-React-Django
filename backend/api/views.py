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
from rest_framework.views import APIView
from rest_framework import status
from django.core.files.storage import default_storage

from django.http import HttpResponse
from django.urls import get_resolver
import boto3
from botocore.client import Config
import os

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
        return Assignment.objects.filter(created_by=cur_user).order_by('-due')
    
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
    
class SubmissionCount(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        # assignment_id = self.kwargs.get('assignment_id')
        submission_count = Submission.objects.filter(assignment_id=assignment_id).count()
        return Response({"count": submission_count})

def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
        aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        region_name="auto",  # R2 ignores region but boto3 requires it
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"}
        ),
    )
    
class GeneratePresignedURLs(APIView):
    def post(self, request):
        file_names = request.data.get("file_names")
        directory = request.data.get("directory", "uploads")

        keys = [f"{directory}/{file_name}" for file_name in file_names]

        s3 = get_r2_client()
        # print("Client endpoint:", s3.meta.endpoint_url)
        content_types = request.data.get("content_types")

        presigned_upload_urls = []
        presigned_download_urls = []
        for i, key in enumerate(keys):
            upload_url = s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": os.getenv("R2_BUCKET_NAME"),
                    "Key": key,
                    "ContentType": content_types[i]
                },
                ExpiresIn=3600  # 1 hour
            )

            download_url = s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": os.getenv("R2_BUCKET_NAME"),
                    "Key": key,
                },
                ExpiresIn=3600,  # 1 hour
            )
            presigned_upload_urls.append(upload_url)
            presigned_download_urls.append(download_url)
            
        return Response({
            "upload_urls": presigned_upload_urls,
            "download_urls": presigned_download_urls
        })
    
class DeleteFilesView(APIView):
    def post(self, request):
        file_urls = request.data.get("file_urls", [])
        s3 = get_r2_client()

        objects_to_delete = []
        for url in file_urls:
            # Extract the key from the URL
            parsed_url = url.split(f"/{os.getenv('R2_BUCKET_NAME')}/")[-1].split("?")[0]
            objects_to_delete.append({"Key": parsed_url})

        if objects_to_delete:
            response = s3.delete_objects(
                Bucket=os.getenv("R2_BUCKET_NAME"),
                Delete={"Objects": objects_to_delete}
            )
            return Response({"deleted": response.get("Deleted", [])}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No files to delete."}, status=status.HTTP_400_BAD_REQUEST)

class AssignmentUpdate(generics.UpdateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cur_user = self.request.user
        return Assignment.objects.filter(created_by=cur_user)