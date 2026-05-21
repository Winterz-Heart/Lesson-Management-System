from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Category, Course, CourseProgress

class UserProfileSignalTests(TestCase):
    def test_creating_a_user_also_creats_a_defualt_profile(self):
        user = User.objects.create_user(
            username="student@example.com",
            password="testpass123",
            first_name="Test",
            last_name="Student"
        )

        self.assertTrue(hasattr(user, "profile"))
        self.assertEqual(user.profile.role, "Student")

class CourseProgressModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        self.teacher = User.objects.create_user(
            username="teacher",
            password="testpass123",
            first_name="Course",
            last_name="Teacher",
        )
        self.category = Category.objects.create(
            title="Python",
            slug="python",
        )
        self.course = Course.objects.create(
            title="Intro to Django",
            slug="intro-to-django",
            short_description="Short",
            long_description="Long",
            created_by=self.teacher,
        )
        self.course.categories.add(self.category)

    def test_mark_started_sets_status_and_started_at(self):
        progress = CourseProgress.objects.create(
            user=self.user,
            course=self.course,
        )

        progress.mark_started()

        self.assertEqual(progress.status, CourseProgress.STATUS_STARTED)
        self.assertIsNotNone(progress.started_at)
        self.assertIsNone(progress.completed_at)

    def test_mark_completed_sets_completed_status_and_timestamps(self):
        progress = CourseProgress.objects.create(
            user=self.user,
            course=self.course,
        )

        progress.mark_completed()

        self.assertEqual(progress.status, CourseProgress.STATUS_COMPLETED)
        self.assertIsNotNone(progress.started_at)
        self.assertIsNotNone(progress.completed_at)

    def test_mark_started_does_not_overwrite_exiisting_started_at(self):
        progress = CourseProgress.objects.create(
            user=self.user,
            course=self.course,
        )

        progress.mark_started()
        first_started_at = progress.started_at

        progress.mark_started()
        self.assertEqual(progress.started_at, first_started_at)


class CourseApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.student = User.objects.create_user(
            username="student@example.com",
            password="testpass123",
            first_name="Test",
            last_name="Student",
        )

        self.teacher = User.objects.create_user(
            username="teacher@example.com",
            password="testpass123",
            first_name="Course",
            last_name="Teacher",
        )
        self.teacher.profile.role = "Teacher"
        self.teacher.profile.save()

        self.admin = User.objects.create_user(
            username="admin@example.com",
            password="testpass123",
            first_name="Site",
            last_name="Admin",
            is_staff=True,
        )
        self.admin.profile.role = "Admin"
        self.admin.profile.save()

        self.category = Category.objects.create(
            title="Backend",
            slug="backend",
        )

        self.published_course = Course.objects.create(
            title="REST APIs",
            slug="rest-apis",
            short_description="Published API course",
            long_description="API course details",
            created_by=self.teacher,
            status=Course.STATUS_PUBLISHED,
        )
        self.published_course.categories.add(self.category)

        self.draft_course = Course.objects.create(
            title="Django",
            slug="django",
            short_description="Draft Django course",
            long_description="Draft Django course details",
            created_by=self.teacher,
            status=Course.STATUS_DRAFT,
        )
        self.draft_course.categories.add(self.category)

    def test_public_course_list_only_returns_published_courses(self):
        response = self.client.get("/api/v1/courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "REST APIs")

    def test_course_list_can_filter_by_category(self):
        response = self.client.get(f"/api/v1/courses/?category_id={self.category.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["slug"], "rest-apis")

    def test_teacher_sees_own_draft_courses_in_course_list(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get("/api/v1/courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_admin_sees_all_courses_in_course_list(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get("/api/v1/courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_public_cannot_view_draft_course_detail(self):
        response = self.client.get(f"/api/v1/courses/{self.draft_course.slug}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["detail"],
            "You do not have permission to view this course",
        )

    def test_teacher_can_view_own_draft_course_detail(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(f"/api/v1/courses/{self.draft_course.slug}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], self.draft_course.slug)

    def test_start_course_requires_authentication(self):
        response = self.client.post(f"/api/v1/courses/{self.published_course.id}/start/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_start_course_creates_started_progress_for_authenticated_user(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(f"/api/v1/courses/{self.published_course.id}/start/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = CourseProgress.objects.get(
            user=self.student,
            course=self.published_course,
        )
        self.assertEqual(progress.status, CourseProgress.STATUS_STARTED)
        self.assertIsNotNone(progress.started_at)

    def test_complete_course_creates_completed_progress_for_authenticated_user(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(f"/api/v1/courses/{self.published_course.id}/complete/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = CourseProgress.objects.get(
            user=self.student,
            course=self.published_course,
        )
        self.assertEqual(progress.status, CourseProgress.STATUS_COMPLETED)
        self.assertIsNotNone(progress.started_at)
        self.assertIsNotNone(progress.completed_at)

    def test_get_my_progress_requires_authentication(self):
        response = self.client.get("/api/v1/courses/my_progress/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_my_progress_returns_current_users_progress(self):
        CourseProgress.objects.create(
            user=self.student,
            course=self.published_course,
            status=CourseProgress.STATUS_STARTED,
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.get("/api/v1/courses/my_progress/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["course"], self.published_course.id)

    def test_get_course_progress_returns_default_not_started_shape_when_missing(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            f"/api/v1/courses/{self.published_course.id}/course_progress/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["course"], self.published_course.id)
        self.assertEqual(response.data["status"], "not_started")
        self.assertIsNone(response.data["started_at"])
        self.assertIsNone(response.data["completed_at"])