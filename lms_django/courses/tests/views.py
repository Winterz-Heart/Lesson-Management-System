from django.contrib.auth.models import Group, User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from ..models import UserProfile, Category, Course, CourseProgress

class CourseViewsTestBase(TestCase):
    base_url = '/api/v1/courses/'

    def create_user(seld, username, first_name, last_name, role, is_staff = False):
        user = User.objects.create_user(
            username = username,
            password = 'testpass123',
            first_name = first_name,
            last_name = last_name,
            email = username,
            is_staff = is_staff,
        )
        user.profile.role = role
        user.profile.save(update_fields = ['role'])
        return user

    def create_course(self, title, slug, created_by, status, categories):
        course = Course.objects.create(
            title = title,
            slug = slug,
            short_description = f'{title} short description',
            long_description = f'{title} long description',
            created_by = created_by,
            status = status
        )
        course.categories.set(categories)
        return course
    
    def authenticate(self, user):
        self.client.force_authenticate(user = user)

    def course_url(self, suffix = ''):
        return f'{self.base_url}{suffix}'

    def setUp(self):
        self.client = APIClient()

        self.student = self.create_user(
            username = 'student@example.com',
            first_name = 'Test',
            last_name = 'Student',
            role = UserProfile.ROLE_STUDENT
        )

        self.other_student = self.create_user(
            username = 'other-student@example.com',
            first_name = 'Other',
            last_name = 'Student',
            role = UserProfile.ROLE_STUDENT
        )

        self.teacher = self.create_user(
            username = 'teacher@example.com',
            first_name = 'Course',
            last_name = 'Teacher',
            role = UserProfile.ROLE_TEACHER
        )

        self.other_teacher = self.create_user(
            username = 'other-teacher@example.com',
            first_name = 'Other',
            last_name = 'Teacher',
            role = UserProfile.ROLE_TEACHER
        )

        self.admin = self.create_user(
            username = 'admin@example.com',
            first_name = 'Site',
            last_name = 'Admin',
            role = UserProfile.ROLE_ADMIN,
            is_staff = True,
        )

        self.backend = Category.objects.create(
            title = 'Backend',
            slug = 'backend'
        )

        self.frontend = Category.objects.create(
            title = 'Forntend',
            slug = 'frontend'
        )

        self.devops = Category.objects.create(
            title = 'DevOps',
            slug = 'devops'
        )

        self.teacher_published = self.create_course(
            title = 'REST APIs',
            slug = 'rest-apis',
            created_by = self.teacher,
            status = Course.STATUS_PUBLISHED,
            categories = [self.backend]
        )

        self.teacher_draft = self.create_course(
            title = 'Django',
            slug = 'django',
            created_by = self.teacher,
            status = Course.STATUS_DRAFT,
            categories = [self.backend]
        )

        self.other_teacher_published = self.create_course(
            title = 'Vue Basics',
            slug = 'vue-basics',
            created_by = self.other_teacher,
            status = Course.STATUS_PUBLISHED,
            categories = [self.frontend]
        )

        self.other_teacher_draft = self.create_course(
            title = 'Pyhton Zero',
            slug = 'python-zero',
            created_by = self.other_teacher,
            status = Course.STATUS_DRAFT,
            categories = [self.devops]
        )

        self.extra_frontpage_one = self.create_course(
            title = 'Python One',
            slug = 'python-one',
            created_by = self.teacher,
            status = Course.STATUS_PUBLISHED,
            categories = [self.backend]
        )

        self.extra_frontpage_two = self.create_course(
            title = 'Python Two',
            slug = 'python-two',
            created_by = self.teacher,
            status = Course.STATUS_PUBLISHED,
            categories = [self.backend]
        )

        self.extra_frontpage_three = self.create_course(
            title = 'Python Three',
            slug = 'python-three',
            created_by = self.teacher,
            status = Course.STATUS_PUBLISHED,
            categories = [self.backend]
        )

class PublicCourseViewTests(CourseViewsTestBase):
    def test_get_categories_returns_all_categories(self):
        response = self.client.get(self.course_url('get_categories/'))

        self.assertEqual(len(response.data), 3)
        self.assertEqual(
            { item['slug'] for item in response.data },
            { 'backend', 'frontend', 'devops' }
        )

    def test_public_course_list_only_returns_published_courses(self):
        response = self.client.get(self.course_url())

        self.assertEqual(len(response.data), 5)
        self.assertEqual(
            { item['slug'] for item in response.data },
            { 'rest-apis', 'vue-basics', 'python-one', 'python-two', 'python-three' }
        )
        self.assertNotIn('django', { item['slug'] for item in response.data })
        self.assertNotIn('pyhton-zero', { item['slug'] for item in response.data })

    def test_public_course_list_can_filter_by_category(self):
        response = self.client.get(self.course_url(f'?category_id={self.frontend.id}'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['slug'], 'vue-basics')

    def test_public_course_list_status_filter_does_not_expose_draft(self):
        response = self.client.get(self.course_url(f'?status=draft'))

        self.assertEqual(response.data, [])

    def test_public_can_view_published_course_detail(self):
        response = self.client.get(self.course_url(f'{self.teacher_published.slug}/'))

        self.assertEqual(response.data['slug'], self.teacher_published.slug)
        self.assertEqual(response.data['status'], Course.STATUS_PUBLISHED)

    def test_public_can_not_view_draft_course_detail(self):
        response = self.client.get(self.course_url(f'{self.teacher_draft.slug}/'))

        self.assertEqual(
            response.data['detail'],
            'You do not have permission to view this course'
        )

    def test_front_page_courses_returns_only_first_four_visible_courses(self):
        response = self.client.get(self.course_url('get_frontpage_courses/'))

        self.assertEqual(len(response.data), 4)
        self.assertNotIn('django', { item['slug'] for item in response.data })
        self.assertNotIn('pyhton-zero', { item['slug'] for item in response.data })

    def test_public_get_teacher_courses_returns_only_public_courses(self):
        response = self.client.get(self.course_url(f'get_teacher_courses/{self.teacher.id}/'))

        self.assertEqual(response.data['created_by']['id'], self.teacher.id)
        self.assertEqual(
            { item['slug'] for item in response.data['courses'] },
            { 'rest-apis', 'python-one', 'python-two', 'python-three' }
        )
