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

class CurrentUserSerializer(BaseUserSerializer):
    role = serializers.CharField(source='profile.role')

    class Meta(BaseUserSerializer.Meta):
        model = BaseUserSerializer.Meta.model
        fields = ('id', 'username', 'first_name', 'last_name', 'role')

    def get_groups(self, user):
        return list(user.groups.values_list('name', flat=True))

    def get_role(self, user):
        if user.is_superuser or user.is_staff:
            return 'admin'

        group_names = {name.lower() for name in user.groups.values_list('name', flat=True)}
        if 'teacher' in group_names:
            return 'teacher'
        
        return 'user'