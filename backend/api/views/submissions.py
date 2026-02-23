from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from api.serializers.submission_serializers import (SubmissionSerializer, SubmissionUpdateSerializer, SubmissionDetailSerializer)
from api.models import Submission
from api.services.ai_evaluator import evaluate_submission

class GetSubmission(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    
    def get_queryset(self):
        assignmenId = self.kwargs.get('assignment_id')
        studentId = self.kwargs.get('student_id')
        submission = Submission.objects.filter(assignment_id=assignmenId, student_id=studentId)
        return submission

class GetSubmissionDetail(generics.RetrieveAPIView):
    serializer_class = SubmissionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        submission = Submission.objects.filter(pk=pk).select_related('assignment_id', 'student_id')
        return submission

class GradeSubmission(generics.UpdateAPIView):
    serializer_class = SubmissionUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.all()
    
class SubmissionCreate(generics.CreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    # permission_classes = [AllowAny]

    def get_queryset(self):
        return Submission.objects.all()
    
class SubmissionCount(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        submission_count = Submission.objects.filter(assignment_id=assignment_id).count()
        return Response({"count": submission_count})

class EvaluateSubmission(APIView):
    def post(self, request):
        submission = request.data.get("submission")
        # text = extract_text(submission.file_path)
        rubric = request.data.get("rubric")
        example_answer = request.data.get("example_answer")

        result = evaluate_submission(submission, rubric, example_answer)

        return Response(result)
