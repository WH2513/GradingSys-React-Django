from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('user/register/', views.CreateUserView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('assignments/', views.AssignmentListCreate.as_view(), name='assignment-list'),
    path('assignments/delete/<uuid:pk>/', views.AssignmentDelete.as_view(), name='delete-assignment'),
    path('assignment/students/<uuid:course_id>/', views.GetCourseStudents.as_view(), name='assignment-students'),
    path('courses/', views.GetCourses.as_view(), name='courses'),
    path('assignment/<uuid:assignment_id>/student/<uuid:student_id>/submission/', views.GetSubmission.as_view(), name='submission'),
    # path('submission/', views.SubmissionCreate.as_view(), name='createSubmission'),
    path('submission/<uuid:pk>/', views.GetSubmissionDetail.as_view(), name='getSubmissionDetail'),
    path('submission/<uuid:pk>/grading/', views.GradeSubmission.as_view(), name='gradeSubmission'),
]