from django.urls import path
from . import views

urlpatterns = [
    path('user/register/', views.CreateUserView.as_view(), name='register'),
    path('user/groups/', views.GetUserWithGroupsView.as_view(), name='get_user_groups'),
    path('token/', views.CookieTokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', views.CookieTokenRefreshView.as_view(), name='refresh'),
    path('assignments/', views.AssignmentListCreate.as_view(), name='assignment-list'),
    path('assignments/delete/<uuid:pk>/', views.AssignmentDelete.as_view(), name='delete-assignment'),
    path('assignment/students/<uuid:course_id>/', views.GetCourseStudents.as_view(), name='assignment-students'),
    path('assignment/<uuid:assignment_id>/student/<uuid:student_id>/submission/', views.GetSubmission.as_view(), name='submission'),
    path('courses/', views.GetCourses.as_view(), name='courses'),
    path('submission/<uuid:pk>/', views.GetSubmissionDetail.as_view(), name='getSubmissionDetail'),
    path('submission/<uuid:pk>/grading/', views.GradeSubmission.as_view(), name='gradeSubmission'),
    path("generate-presigned-urls/", views.GeneratePresignedURLs.as_view(), name="generate-presigned-urls"),
    path('delete-files/', views.DeleteFilesView.as_view(), name='delete-files'),
    path('assignments/<uuid:pk>/', views.AssignmentUpdate.as_view(), name='assignment-update'),
]

    # path('submission/', views.SubmissionCreate.as_view(), name='createSubmission'),
