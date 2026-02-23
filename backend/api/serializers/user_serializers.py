
from rest_framework import serializers
from django.contrib.auth.models import User, Group


class GroupsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    groups = GroupsSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'groups']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user