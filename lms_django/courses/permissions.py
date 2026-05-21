from rest_framework.permissions import BasePermission

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.profile.role == 'Teacher'
        )
    
class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.profile.role == 'Student'
        )
    
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (
                request.user.is_staff or
                request.user.is_superuser or
                request.user.profile.role == 'Admin'
            )
        )
    
class IsTeacherOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        role = request.user.profile.role
        return role in ('Teacher', 'Admin') or request.user.is_staff