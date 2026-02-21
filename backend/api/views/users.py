from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from api.serializers.user_serializers import UserSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class GetUserWithGroupsView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'

    def get_object(self):
        queryset = self.get_queryset()
        lookup_value = self.kwargs[self.lookup_field]
        return queryset.get(**{self.lookup_field: lookup_value})


    def get_queryset(self):
        username = self.kwargs.get('username')
        password = self.kwargs.get('password')
        # user = User.objects.get(username=username, password=password).groups.all()
        user = User.objects.filter(username=username, password=password).select_related('groups')
        # submission = Submission.objects.filter(pk=pk).select_related('assignment_id', 'student_id')
        # groups = User.objects.get(username=username).groups.all()
        return user