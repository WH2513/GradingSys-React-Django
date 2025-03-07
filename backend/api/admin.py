from django.contrib import admin

from .models import Course, Assignment

class AssignmentAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {"fields": ['course_id', 'type']}),
        ('Detail', {"fields": ['title', 'description', 'total_score', 'due', 'files']}),
    ]

    list_display = ["title", "created_at", "due"]
    list_filter = ['course_id', "type"]
    search_fields = ["title"]

class CourseAdmin(admin.ModelAdmin):
    list_display = ["course_name", "grade_level", "period"]
    list_filter = ['grade_level', "period"]
    search_fields = ["course_name"]

# Register your models here.
admin.site.register(Course, CourseAdmin)
admin.site.register(Assignment, AssignmentAdmin)
