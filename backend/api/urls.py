from django.urls import path
from . import views
from .views import healthCheck, authentication, users, courses, assignments, submissions, files

urlpatterns = [
    path('health/', healthCheck.HealthCheck.as_view(), name='health-check'),
    path('user/register/', users.CreateUserView.as_view(), name='register'),
    path('user/groups/', users.GetUserWithGroupsView.as_view(), name='get_user_groups'),
    path('token/', authentication.CookieTokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', authentication.CookieTokenRefreshView.as_view(), name='refresh'),
    path('assignments/', assignments.AssignmentListCreate.as_view(), name='assignment-list'),
    path('assignments/delete/<uuid:pk>/', assignments.AssignmentDelete.as_view(), name='delete-assignment'),
    path('assignment/students/<uuid:course_id>/', courses.GetCourseStudents.as_view(), name='assignment-students'),
    path('assignment/<uuid:assignment_id>/student/<uuid:student_id>/submission/', submissions.GetSubmission.as_view(), name='submission'),
    path('courses/', courses.GetCourses.as_view(), name='courses'),
    path('submission/count/<uuid:assignment_id>/', submissions.SubmissionCount.as_view(), name='submission-count'),
    path('submission/<uuid:pk>/', submissions.GetSubmissionDetail.as_view(), name='getSubmissionDetail'),
    path('submission/<uuid:pk>/grading/', submissions.GradeSubmission.as_view(), name='gradeSubmission'),
    path("generate-presigned-urls/", files.GeneratePresignedURLs.as_view(), name="generate-presigned-urls"),
    path('delete-files/', files.DeleteFilesView.as_view(), name='delete-files'),
    path('assignments/<uuid:pk>/', assignments.AssignmentUpdate.as_view(), name='assignment-update'),
    path('assignments/count/', assignments.AssignmentListCreate.as_view(), name='assignment-count'),
    path('assignments/?page=<int:page>/', assignments.AssignmentListCreate.as_view(), name='assignment-list-paginated'),
    path('assignment-creation-email/', assignments.SendAssignmentEmails.as_view(), name='send-assignment-emails'),
    path('submission/ai-grading/', submissions.EvaluateSubmission.as_view(), name='evaluate-submission'),

    # path('gcode/process/', views.GcodeProcessingView.as_view(), name='gcode-process'),
]

    # path('submission/', views.SubmissionCreate.as_view(), name='createSubmission'),
