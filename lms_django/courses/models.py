from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

class Category(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField()
    short_description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.title
    
class Course(models.Model):
    categories = models.ManyToManyField(Category)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    short_description = models.TextField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='courses', on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class CourseProgress(models.Model):
    STATUS_NOT_STARTED = 'not_started'
    STATUS_STARTED = 'started'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = [
        (STATUS_NOT_STARTED, 'Not Started'),
        (STATUS_STARTED, 'Started'),
        (STATUS_COMPLETED, 'Completed'),
    ]

    user = models.ForeignKey(User, related_name='courses_progress', on_delete=models.CASCADE)
    course = models.ForeignKey('Course', related_name='progress_records', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NOT_STARTED)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('user', 'course')

    def mark_started(self):
        if self.status == self.STATUS_NOT_STARTED:
            self.status = self.STATUS_STARTED
        if self.started_at is None:
            self.started_at = timezone.now()

    def mark_completed(self):
        self.status = self.STATUS_COMPLETED
        if self.started_at is None:
            self.started_at = timezone.now()
        if self.completed_at is None:
            self.completed_at = timezone.now()

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - {self.course.title} ({self.status})'