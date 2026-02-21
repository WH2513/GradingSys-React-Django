from rest_framework import serializers
from api.models import Assignment

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'course_id', 'type', 'title', 'description', 
                  'total_score', 'created_by', 'created_at', 'due', 'file_urls', 'rubric', 'example_answer']
        extra_kwargs = {'created_by': {'read_only': True}}