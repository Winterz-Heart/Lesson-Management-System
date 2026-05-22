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

class ProgressViewTests(CourseViewsTestBase):
    def test_start_course_creates_started_course_for_user(self):
        self.authenticate(self.student)

        response = self.client.post(self.course_url(f'{self.teacher_published.id}/start/'))

        progress = CourseProgress.objects.get(
            user = self.student,
            course = self.teacher_published,
        )

        self.assertEqual(progress.status, CourseProgress.STATUS_STARTED)
        self.assertIsNotNone(progress.started_at)
        self.assertIsNone(progress.completed_at)

    def test_complete_course_creates_completed_course_for_user(self):
        self.authenticate(self.student)
        
        response = self.client.post(self.course_url(f'{self.teacher_published.id}/complete/'))

        progress = CourseProgress.objects.get(
            user = self.student,
            course = self.teacher_published,
        )

        self.assertEqual(progress.status, CourseProgress.STATUS_COMPLETED)
        self.assertIsNotNone(progress.started_at)
        self.assertIsNotNone(progress.completed_at)

    def test_get_my_progress_only_returns_current_user_progress(self):
        CourseProgress.objects.create(
            user = self.student,
            course = self.teacher_published,
            status = CourseProgress.STATUS_STARTED,
        )

        CourseProgress.objects.create(
            user = self.other_student,
            course = self.teacher_published,
            status = CourseProgress.STATUS_COMPLETED,
        )
        
        self.authenticate(self.student)

        response = self.client.get(self.course_url('my_progress/'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['course'], self.teacher_published.id)

    def test_get_course_progress_returns_existing_progress(self):
        CourseProgress.objects.create(
            user = self.student,
            course = self.teacher_published,
            status = CourseProgress.STATUS_STARTED,
        )
        self.authenticate(self.student)

        response = self.client.get(self.course_url(f'{self.teacher_published.id}/course_progress/'))
        self.assertEqual(response.data['course'], self.teacher_published.id)
        self.assertEqual(response.data['status'], CourseProgress.STATUS_STARTED)
        self.assertEqual(response.data['course_slug'], self.teacher_published.slug)

class TeacherCourseViewTests(CourseViewsTestBase):
    def test_teacher_course_list_can_include_own_drafts(self):
        self.authenticate(self.teacher)

        response = self.client.get(self.course_url())

        self.assertIn('django', { item['slug'] for item in response.data })
        self.assertNotIn('python-zero', { item['slug'] for item in response.data })

    def test_teacher_course_list_filter_return_only_own_drafts(self):
        self.authenticate(self.teacher)

        response = self.client.get(self.course_url('?status=draft'))

        self.assertIn('django', { item['slug'] for item in response.data })
        self.assertNotIn('python-zero', { item['slug'] for item in response.data })

    def test_teacher_can_view_own_draft_course_detail(self):
        self.authenticate(self.teacher)

        response = self.client.get(self.course_url(f'{self.teacher_draft.slug}/'))

        self.assertEqual(response.data['slug'], self.teacher_draft.slug)

    def test_admin_can_view_any_draft_course_detail(self):
        self.authenticate(self.admin)

        response = self.client.get(self.course_url(f'{self.other_teacher_draft.slug}/'))

        self.assertEqual(response.data['slug'], self.other_teacher_draft.slug)

    def test_teacher_get_teacher_courses_returns_own_drafts_and_published(self):
        self.authenticate(self.teacher)

        response = self.client.get(self.course_url(f'get_teacher_courses/{self.teacher.id}/'))

        self.assertEqual(
            { item['slug'] for item in response.data['courses'] },
            { 'rest-apis', 'django', 'python-one', 'python-two', 'python-three' }
        )

    def test_teacher_can_create_course(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            self.course_url('teacher/create/'),
            {
                'title': 'New Course',
                'slug': 'new-course',
                'short_description': 'Short',
                'long_description': 'Long',
                'categories': [self.backend.id, self.frontend.id],
                'status': Course.STATUS_DRAFT,
            }
        )

        created = Course.objects.get(slug = 'new-course')
        self.assertEqual(created.created_by, self.teacher)
        self.assertEqual(created.status, Course.STATUS_DRAFT)
        self.assertEqual(created.categories.count(), 2)

    def test_teacher_can_create_category(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            self.course_url('teacher/create/categories/'),
            {
                'title': 'Data',
                'slug': 'data'
            }
        )

        self.assertTrue(Category.objects.filter(slug = 'data').exists())

    def test_teacher_can_edit_own_course(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            self.course_url(f'teacher/{self.teacher_published.id}/edit/'),
            { 'title': 'REST APIs Updated' }
        )

        self.teacher_published.refresh_from_db()
        self.assertEqual(self.teacher_published.title, 'REST APIs Updated')

    def test_teacher_can_not_edit_another_teachers_courses(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            self.course_url(f'teacher/{self.other_teacher_published.id}/edit/'),
            { 'title': 'Should Not Work' }
        )

        self.teacher_published.refresh_from_db()
        self.assertEqual(
            response.data['detail'],
            'You do not have permission to edit this course'
        )

    def test_get_my_draft_only_returns_current_teachers_drafts(self):
        self.authenticate(self.teacher)

        response = self.client.get(self.course_url('teacher/my_drafts/'))

        self.assertEqual({ item['slug'] for item in response.data }, { 'django' })

    def test_get_my_published_only_returns_current_teachers_published(self):
        self.authenticate(self.teacher)

        response = self.client.get(self.course_url('teacher/my_published/'))

        self.assertEqual(
            { item['slug'] for item in response.data },
            { 'rest-apis',  'python-one', 'python-two', 'python-three' }
        )

    def test_teacher_can_ciew_student_progress_table(self):
        CourseProgress.objects.create(
            user = self.student,
            course = self.teacher_published,
            status = CourseProgress.STATUS_STARTED
        )
        self.authenticate(self.teacher)

        response = self.client.get(self.course_url('teacher/student-progress-table/'))

        self.assertEqual(
            { item['id'] for item in response.data },
            { self.student.id, self.other_student.id }
        )

    def test_teacher_can_delete_own_course(self):
        self.authenticate(self.teacher)

        response = self.client.delete(self.course_url(f'teacher/{self.teacher_published.id}/delete/'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Course.objects.filter(id = self.teacher_published.id).exists())

    def test_teacher_can_not_delete_other_teachers_course(self):
        self.authenticate(self.teacher)

        response = self.client.delete(self.course_url(f'teacher/{self.other_teacher_published.id}/delete/'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['detail'],
            'You do not have permission to delete this course'
        )

class AdminCourseViewTests(CourseViewsTestBase):
    def test_admin_get_teacher_courses_retunrs_all_courses_for_teacher(self):
        self.authenticate(self.admin)

        response = self.client.get(self.course_url(f'get_teacher_courses/{self.teacher.id}/'))

        self.assertEqual(
            { item['slug'] for item in response.data['courses'] },
            { 'rest-apis', 'django', 'python-one', 'python-two', 'python-three' }
        )

    def test_admin_can_view_all_draft_courses(self):
        self.authenticate(self.admin)

        response = self.client.get(self.course_url('admin/drafts/'))

        self.assertEqual(
            { item['slug'] for item in response.data },
            { 'django', 'python-zero' }
        )

    def test_admin_can_view_all_published_courses(self):
        self.authenticate(self.admin)

        response = self.client.get(self.course_url('admin/published/'))

        self.assertEqual(
            { item['slug'] for item in response.data },
            { 'rest-apis', 'vue-basics',  'python-one', 'python-two', 'python-three' }
        )

    def test_admin_can_assign_student_to_course(self):
        self.authenticate(self.admin)

        self.client.post(
            self.course_url('admin/student-progress/create/'),
            {
                'user': self.student.id,
                'course': self.teacher_published.id,
                'status': CourseProgress.STATUS_NOT_STARTED
            }
        )

        progress = CourseProgress.objects.get(
            user = self.student,
            course = self.teacher_published
        )

        self.assertEqual(progress.status, CourseProgress.STATUS_STARTED)
        self.assertIsNotNone(progress.started_at)

    def test_admin_can_update_progress(self):
        progress = CourseProgress.objects.create(
            user = self.student,
            course = self.teacher_published,
            status = CourseProgress.STATUS_STARTED
        )
        self.authenticate(self.admin)

        self.client.patch(
            self.course_url(f'admin/student-progress/update/{progress.id}/'),
            { 'status': CourseProgress.STATUS_COMPLETED }
        )

        progress.refresh_from_db()
        self.assertEqual(progress.status, CourseProgress.STATUS_COMPLETED)

    def test_admin_can_remove_student_fron_course(self):
        progress = CourseProgress.objects.create(
            user = self.student,
            course = self.teacher_published,
            status = CourseProgress.STATUS_STARTED
        )
        self.authenticate(self.admin)

        self.client.delete(
            self.course_url(f'admin/student-progress/delete/{progress.id}/')
        )

        self.assertFalse(CourseProgress.objects.filter(id = progress.id).exists())

    def test_admin_can_get_user_with_role(self):
        self.authenticate(self.admin)

        response = self.client.get(self.course_url('admin/users/roles/'))
        by_email = { item['email']: item['role'] for item in response.data }
        
        self.assertEqual(by_email['student@example.com'], UserProfile.ROLE_STUDENT)
        self.assertEqual(by_email['teacher@example.com'], UserProfile.ROLE_TEACHER)
        self.assertEqual(by_email['admin@example.com'], UserProfile.ROLE_ADMIN)

    def test_admin_can_change_user_role(self):
        self.authenticate(self.admin)

        self.client.patch(
            self.course_url('admin/users/roles/change-role/'),
            {
                'user_id': self.student.id,
                'new_role': UserProfile.ROLE_ADMIN,
            }
        )


        self.student.refresh_from_db()
        self.student.profile.refresh_from_db()

        self.assertEqual(self.student.profile.role, UserProfile.ROLE_ADMIN)
        self.assertTrue(self.student.is_staff)
        self.assertTrue(
            Group.objects.filter(
                name=UserProfile.ROLE_ADMIN,
                user=self.student,
            ).exists()
        )

    def test_admin_can_delete_category_and_remove_it_from_courses(self):
        standalone = self.create_course(
            title = 'Standalone',
            slug = 'standalone',
            created_by = self.teacher,
            status = Course.STATUS_PUBLISHED,
            categories = [self.devops],
        )
        self.authenticate(self.admin)
        
        self.client.delete(self.course_url(f'admin/categories/delete/{self.devops.id}/'))

        self.assertFalse(Category.objects.filter(id = self.devops.id).exists())
        standalone.refresh_from_db()
        self.assertEqual(standalone.categories.count(), 0)

    def test_admin_can_delete_user(self):
        self.authenticate(self.admin)

        self.client.delete(
            self.course_url(f'admin/users/delete/{self.student.id}/')
        )

        self.assertFalse(User.objects.filter(id=self.student.id).exists())
        self.assertFalse(UserProfile.objects.filter(user_id=self.student.id).exists())

    def test_admin_can_not_delete_own_account(self):
        self.authenticate(self.admin)

        response = self.client.delete(
            self.course_url(f'admin/users/delete/{self.admin.id}/')
        )

        self.assertEqual(
            response.data['detail'],
            'You cannot delete your own account'
        )
        self.assertTrue(User.objects.filter(id=self.admin.id).exists())