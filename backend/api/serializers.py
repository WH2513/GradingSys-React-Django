from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Assignment, Course, Student, Submission

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'grade_level', 'period', 'course_name']

    def create(self, validated_data):
        course = Course.objects.create_course(**validated_data)
        return course
        
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'course_id', 'type', 'title', 'description', 
                  'total_score', 'created_by', 'created_at', 'due', 'files']
        extra_kwargs = {'created_by': {'read_only': True}}

class CourseStudentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name']

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'assignment_id', 'student_id', 'status', 'score', 'files', 'content']

class SubmissionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['score', 'status']

class SubmissionDetailSerializer(serializers.ModelSerializer):
    student_id = CourseStudentsSerializer(read_only=True)
    assignment_id = AssignmentSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'assignment_id', 'student_id', 'status', 'score', 'files', 'content']


