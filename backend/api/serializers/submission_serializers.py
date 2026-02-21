from rest_framework import serializers
from api.models import Submission
from api.serializers.course_serializers import CourseStudentsSerializer
from api.serializers.assignment_serializers import AssignmentSerializer

class SubmissionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'assignment_id', 'student_id', 'status', 'status_display', 'score', 'files', 'content']

class SubmissionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['score', 'status', 'comment']

class SubmissionDetailSerializer(serializers.ModelSerializer):
    student_id = CourseStudentsSerializer(read_only=True)
    assignment_id = AssignmentSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'assignment_id', 'student_id', 'status', 'score', 'files', 'content']