from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    ROLE_STUDENT = 'student'
    ROLE_AUTHOR = 'author'
    ROLE_ADMIN = 'admin'

    ROLE_CHOICES = [
        (ROLE_STUDENT, 'Student'),
        (ROLE_AUTHOR, 'Author'),
        (ROLE_ADMIN, 'Admin'),
    ]

    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)

    def __str__(self):
        return f'{self.user.username} ({self.role})'
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

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
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_PUBLISHED, 'Published')
    ]

    categories = models.ManyToManyField(Category)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    short_description = models.TextField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(blank=True, null=True)
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