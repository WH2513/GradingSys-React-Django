from rest_framework import status, generics
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.core.mail import send_mail
from django.contrib.auth.models import User

from backend.api.services.ai_evaluator import evaluate_submission
from .serializers import (UserSerializer, CourseSerializer, AssignmentSerializer, \
    CourseStudentsSerializer, SubmissionSerializer, SubmissionDetailSerializer, SubmissionUpdateSerializer)
from .models import Assignment, Course, Submission

import boto3
from botocore.client import Config
import os

import re

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
            print("Generating presigned URL for key:", key)
            upload_url = s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": os.getenv("R2_BUCKET_NAME"),
                    "Key": key
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

class HealthCheck(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)

class SendAssignmentEmails(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        assignment = request.data.get("assignment")
        try:
            assignment = Assignment.objects.get(id=assignment["id"])
            course = assignment.course_id
            students = course.student_set.all()
            to_emails = [student.email for student in students if student.email] + [request.user.email]

            subject = f"New Assignment Created by {request.user.username}: {assignment.title}"
            message = f"Dear Student,\n\nA new assignment titled '{assignment.title}' has been created for your course '{course.course_name}'.\n\nPlease check the grading system portal for more details and to submit your work before the due date: {assignment.due}.\n\nBest regards,\nGrading System Team"

            send_mail(
                subject,
                message,
                "breehope@icloud.com",  # from
                # "no-reply@gradingsys-react-django.pages.dev",  # from
                to_emails,                 # to
                fail_silently=False,
            )

            return Response({"message": "Emails sent successfully."}, status=status.HTTP_200_OK)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EvaluateSubmission(APIView):
    def post(self, request, assignment_id):
        submission = request.data.get("submission")
        # text = extract_text(submission.file_path)
        rubric = request.data.get("rubric")

        result = evaluate_submission(submission, rubric)

        return Response(result)

class GcodeProcessingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        gcode_files = request.FILES.getlist("gcode_files", [])
        if not gcode_files:
            return Response({"error": "No file uploaded"}, status=400)

        all_results = {}

        for gcode_file in gcode_files:
            file_line_count = 0
            file_target_command_count = 0
            file_results = []
            buffer = ""

            last_position = {'X': 0.0, 'Y': 0.0, 'Z': 0.0}
            total_distance = 0.0

            # Stream file in chunks
            for chunk in gcode_file.chunks():
                text = chunk.decode("utf-8", errors="ignore")
                buffer += text

                lines = buffer.split("\n")
                buffer = lines.pop()  # keep last partial line
                
                file_line_count += len(lines)
                target_commands = [line.strip() for line in lines if line.strip() and line.startswith(('G0','G28'))]
                file_target_command_count += len(target_commands)

                # Calculate distance moved
                for line in target_commands:
                    command, params = parse_gcode_command_line(line)
                    distance, new_position = get_distance(last_position, params)
                    total_distance += distance
                    last_position = new_position

                # leftover partial line
                if buffer and buffer.startswith(('G0','G28')):
                    file_line_count += 1
                    file_target_command_count += 1
                    command, params = parse_gcode_command_line(buffer)
                    distance, new_position = get_distance(last_position, params)
                    total_distance += distance

            file_results = {
                "file_size": str(gcode_file.size // 1024 // 1024) + ' MB',
                "line_count": file_line_count,
                "target_command_count": file_target_command_count,
                "distance_travelled": str(total_distance) + ' mm',
            }
            all_results[gcode_file.name] = file_results

        return Response({"results": all_results})
    
def parse_gcode_command_line(line):
    parts = line.split()
    command = parts[0]
    params = {}
    if command == 'G0':
        for part in parts[1:]:
            match = re.match(r'([A-Z])([-+]?[0-9]*\.?[0-9]+)', part)
            if match:
                key = match.group(1)
                value = float(match.group(2))
                params[key] = value
    return command, params

def get_distance(last_position, params):
    if 'X' in params or 'Y' in params or 'Z' in params:
        new_position = {
            'X': params.get('X', last_position['X']),
            'Y': params.get('Y', last_position['Y']),
            'Z': params.get('Z', last_position['Z'])
        }

    new_position = {
        'X': 0.0,
        'Y': 0.0,
        'Z': 0.0
    }

    return sum((new_position[k] - last_position[k])**2 for k in ['X', 'Y', 'Z'])**0.5, new_position
