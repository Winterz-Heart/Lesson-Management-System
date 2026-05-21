from rest_framework import serializers

from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer
from courses.models import UserProfile

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta:
        model = BaseUserCreateSerializer.Meta.model
        fields = ('id', 'username', 'password', 'first_name', 'last_name')

class UserSerializer(BaseUserSerializer):
    class Meta:
        model = BaseUserSerializer.Meta.model
        fields = ('id', 'username', 'first_name', 'last_name')

class CurrentUserSerializer(BaseUserSerializer):
    role = serializers.SerializerMethodField()

    class Meta(BaseUserSerializer.Meta):
        model = BaseUserSerializer.Meta.model
        fields = ('id', 'username', 'first_name', 'last_name', 'role')

    def get_groups(self, user):
        return list(user.groups.values_list('name', flat=True))

    def get_role(self, user):
        if user.is_superuser or user.is_staff:
            return UserProfile.ROLE_ADMIN

        profile = getattr(user, 'profile', None)
        if profile and profile.role in dict(UserProfile.ROLE_CHOICES):
            return profile.role

        group_names = {name.lower() for name in user.groups.values_list('name', flat=True)}
        if 'Admin' in group_names:
            return UserProfile.ROLE_ADMIN
        if 'Teacher' in group_names:
            return UserProfile.ROLE_TEACHER

        return UserProfile.ROLE_STUDENT