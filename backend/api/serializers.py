from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Assignment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

        def create(self, validated_user):
            user = User.objects.create_user(validated_user)
            return user
        
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'course_id', 'type', 'title', 'description', 'total_score', 'created_by', 'created_at', 'due', 'files']
        extra_kwargs = {'created_by': {'read_only': True}}