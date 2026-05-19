from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Category, Course, CourseProgress

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

class CourseApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
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
            title="Backend",
            slug="backend",
        )
        self.course = Course.objects.create(
            title="REST APIs",
            slug="rest-apis",
            short_description="API course",
            long_description="API course details",
            created_by=self.teacher,
        )
        self.course.categories.add(self.category)

    def test_get_courses_returns_courses(self):
        response = self.client.get("/api/v1/courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "REST APIs")

    def test_get_courses_can_filter_by_category(self):
        response = self.client.get(f"/api/v1/courses/?category_id={self.category.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_start_course_requires_authentication(self):
        response = self.client.post(f"/api/v1/courses/{self.course.id}/start/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_start_course_creates_progress_for_authenticated_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(f"/api/v1/courses/{self.course.id}/start/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = CourseProgress.objects.get(user=self.user, course=self.course)
        self.assertEqual(progress.status, CourseProgress.STATUS_STARTED)

    def test_complete_course_marks_progress_completed(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(f"/api/v1/courses/{self.course.id}/complete/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = CourseProgress.objects.get(user=self.user, course=self.course)
        self.assertEqual(progress.status, CourseProgress.STATUS_COMPLETED)
        self.assertIsNotNone(progress.completed_at)