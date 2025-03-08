from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Assignment, Course

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
        fields = ['id', 'course_id', 'type', 'title', 'description', 'total_score', 'created_by', 'created_at', 'due']
        extra_kwargs = {'created_by': {'read_only': True}}