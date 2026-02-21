from rest_framework import generics

from api.serializers.course_serializers import CourseSerializer, CourseStudentsSerializer
from api.models import Course
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