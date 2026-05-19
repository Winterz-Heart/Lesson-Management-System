from django.contrib import admin

from .models import Category, Course, CourseProgress, UserProfile

admin.site.register(Category)
admin.site.register(Course)

@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'status', 'started_at', 'completed_at')
    list_filter = ('status', 'started_at', 'completed_at')
    search_fields = ('user__username', 'user__email', 'course__title')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)