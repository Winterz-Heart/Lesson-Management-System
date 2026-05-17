from rest_framework import serializers

from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta:
        model = BaseUserCreateSerializer.Meta.model
        fields = ('id', 'username', 'password', 'first_name', 'last_name')

class UserSerializer(BaseUserSerializer):
    class Meta:
        model = BaseUserSerializer.Meta.model
        fields = ('id', 'username', 'first_name', 'last_name')