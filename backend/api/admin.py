from django.contrib import admin

from .models import Course, Assignment, Student

class AssignmentAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {"fields": ['course_id', 'type']}),
        ('Detail', {"fields": ['title', 'description', 'total_score', 'due', 'files']}),
    ]

    list_display = ['id', "title", "created_at", "due"]
    list_filter = ['course_id', "type"]
    search_fields = ["title"]

class CourseAdmin(admin.ModelAdmin):
    list_display = ['id', "course_name", "grade_level", "period"]
    list_filter = ['grade_level', "period"]
    search_fields = ["course_name"]


# class StudentAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name', 'grade_level', 'get_courses')

#     def get_courses(self, obj):
#         return "\n".join([c.course_name for c in obj.courses.all()])

# Register your models here.
admin.site.register(Course, CourseAdmin)
admin.site.register(Assignment, AssignmentAdmin)
admin.site.register(Student)