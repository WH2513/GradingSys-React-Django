from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.serializers.assignment_serializers import AssignmentSerializer
from api.models import Assignment
from django.core.mail import send_mail


class AssignmentListCreate(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    # permission_classes = [AllowAny]

    def get_queryset(self):
        cur_user = self.request.user
        return Assignment.objects.filter(created_by=cur_user).order_by('-due')
    
    # Manually set created_by as current user, since the model set it as read-only
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("VALIDATION ERRORS:", serializer.errors)
            return Response(serializer.errors, status=400)
        return super().create(request, *args, **kwargs)


class AssignmentDelete(generics.DestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cur_user = self.request.user
        return Assignment.objects.filter(created_by=cur_user)

class AssignmentUpdate(generics.UpdateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cur_user = self.request.user
        return Assignment.objects.filter(created_by=cur_user)
    
class SendAssignmentEmails(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        assignment = request.data.get("assignment")
        try:
            assignment = Assignment.objects.get(id=assignment["id"])
            course = assignment.course_id
            students = course.student_set.all()
            to_emails = [student.email for student in students if student.email] + [request.user.email]

            subject = f"New Assignment Created by {request.user.username}: {assignment.title}"
            message = f"Dear Student,\n\nA new assignment titled '{assignment.title}' has been created for your course '{course.course_name}'.\n\nPlease check the grading system portal for more details and to submit your work before the due date: {assignment.due}.\n\nBest regards,\nGrading System Team"

            send_mail(
                subject,
                message,
                "breehope@icloud.com",  # from
                # "no-reply@gradingsys-react-django.pages.dev",  # from
                to_emails,                 # to
                fail_silently=False,
            )

            return Response({"message": "Emails sent successfully."}, status=status.HTTP_200_OK)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)