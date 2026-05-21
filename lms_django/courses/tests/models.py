from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import TestCase

from ..models import Category, Course, CourseProgress, UserProfile

class UserProfileModelTests(TestCase):
    def test_creating_user_auto_creates_profile(self):
        user = User.objects.create_user(
            username = 'alice',
            email = 'alice@example.com',
            password = 'testpass123'
        )

        profile = UserProfile.objects.get(user = user)

        self.assertEqual(profile.role, UserProfile.ROLE_STUDENT)

    def tests_string_representation_returns_username_and_role(self):
        user = User.objects.create_user(
            username = 'alice',
            email = 'alice@example.com',
            password = 'testpass123'
        )

        self.assertEqual(str(user.profile), 'alice (Student)')

    def test_deleting_user_deletes_profile(self):
        user = User.objects.create_user(
            username = 'bob',
            password = 'testpass123'
        )
        profile_id = user.profile.id

        user.delete()
        self.assertFalse(UserProfile.objects.filter(id = profile_id).exists())

class CategoryModelTests(TestCase):
    def tests_string_representation_returns_title(self):
        category = Category.objects.create(
            title = 'Python',
            slug = 'python'
        )

        self.assertEqual(str(category), 'Python')
    
    def test_verbose_name_plural_is_categories(self):
        self.assertEqual(Category._meta.verbose_name_plural, 'Categories')

class CourseModelTests(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username = 'teacher',
            password = 'testpass123',
        )
        self.category = Category.objects.create(
            title = 'Backend',
            slug = 'backend',
        )

    def tests_string_representation_returns_title(self):
        course = Course.objects.create(
            title = 'Django Basics',
            slug = 'django-basics',
            created_by = self.teacher
        )

        self.assertEqual(str(course), 'Django Basics')

    def test_default_status_is_draft(self):
        course = Course.objects.create(
            title = 'Django Basics',
            slug = 'django-basics',
            created_by = self.teacher
        )

        self.assertEqual(course.status, Course.STATUS_DRAFT)

    def test_slug_must_be_unique(self):
        Course.objects.create(
            title = 'First Course',
            slug = 'shared-slug',
            created_by = self.teacher
        )

        with self.assertRaises(IntegrityError):
            Course.objects.create(
                title = 'Second Course',
                slug = 'shared-slug',
                created_by = self.teacher
            )

    def test_can_be_associated_with_categories(self):
        course = Course.objects.create(
            title = 'Django Basics',
            slug = 'django-basics',
            created_by = self.teacher
        )

        course.categories.add(self.category)

        self.assertEqual(course.categories.count(), 1)
        self.assertEqual(course.categories.first(), self.category)

class CourseProgressModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username = 'student',
            password = 'testpass123',
            first_name = 'Test',
            last_name = 'User'
        )
        self.teacher = User.objects.create_user(
            username = 'teacher',
            password = 'testpass123'
        )
        self.course = Course.objects.create(
            title = 'Intro to Django',
            slug = 'intro-to-django',
            created_by = self.teacher
        )

    def test_string_reprsentation_returns_user_course_and_status(self):
        progress = CourseProgress.objects.create(
            user = self.user,
            course = self.course
        )

        self.assertEqual(str(progress), 'Test User - Intro to Django (not_started)')

    def test_default_is_not_started(self):
        progress = CourseProgress.objects.create(
            user = self.user,
            course = self.course
        )

        self.assertEqual(progress.status, CourseProgress.STATUS_NOT_STARTED)
        self.assertIsNone(progress.started_at)
        self.assertIsNone(progress.completed_at)

    def test_user_course_pair_must_be_unique(self):
        CourseProgress.objects.create(
            user = self.user,
            course = self.course
        )

        with self.assertRaises(IntegrityError):
            CourseProgress.objects.create(
                user = self.user,
                course = self.course
            )
    
    def test_mark_started_set_status_and_started_at(self):
        progress = CourseProgress.objects.create(
            user = self.user,
            course = self.course
        )

        progress.mark_started()

        self.assertEqual(progress.status, CourseProgress.STATUS_STARTED)
        self.assertIsNotNone(progress.started_at)
        self.assertIsNone(progress.completed_at)

    def test_mark_started_does_not_overwrite_exsting_started_at(self):
        progress = CourseProgress.objects.create(
            user = self.user,
            course = self.course
        )

        progress.mark_started()
        first_started = progress.started_at

        progress.mark_started()

        self.assertEqual(progress.started_at, first_started)

    def test_mark_completed_sets_completed_status_and_timestamps(self):
        progress = CourseProgress.objects.create(
            user = self.user,
            course = self.course
        )

        progress.mark_completed()

        self.assertEqual(progress.status, CourseProgress.STATUS_COMPLETED)
        self.assertIsNotNone(progress.started_at)
        self.assertIsNotNone(progress.completed_at)

    def test_mark_completed_does_not_overwrite_exsting_timestamps(self):
        progress = CourseProgress.objects.create(
            user = self.user,
            course = self.course
        )

        progress.mark_completed()
        first_started = progress.started_at
        first_completed = progress.completed_at

        progress.mark_completed()

        self.assertEqual(progress.started_at, first_started)
        self.assertEqual(progress.completed_at, first_completed)
