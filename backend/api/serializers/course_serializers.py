from rest_framework import serializers
from api.models import Course, Student

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'grade_level', 'period', 'course_name']

    def create(self, validated_data):
        course = Course.objects.create_course(**validated_data)
        return course

class CourseStudentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name']