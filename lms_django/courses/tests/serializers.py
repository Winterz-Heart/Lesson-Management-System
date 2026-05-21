from django.contrib.auth.models import User
from django.test import TestCase

from ..models import (
    Category,
    Course,
    CourseProgress,
    UserProfile
)
from ..serializers import (
    UserSerializer,
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CourseProgressSerializer,
    CourseProgressCreateSerializer,
    CourseWriteSerializer,
    CategoryWriteSerializer,
    StudentCourseProgessSerializer
    )

class UserSerializerTests(TestCase):
    def test_serialize_expected_fields(self):
        user = User.objects.create_user(
            username = 'alice',
            email = 'alice@example.com',
            password = 'testpass123',
            first_name = 'Alice',
            last_name = 'Jones'
        )

        serializer = UserSerializer(user)

        self.assertEqual(
            serializer.data,
            {
                'id': user.id,
                'first_name': 'Alice',
                'last_name': 'Jones'
            }
        )

    def test_only_includes_declared_fields(self):
        user = User.objects.create_user(
            username = 'bob',
            email = 'bob@example.com',
            password = 'testpass123',
            first_name = 'Bob',
            last_name = 'Smith'
        )

        serializer = UserSerializer(user)

        self.assertEqual(set(serializer.data.keys()), {'id', 'first_name', 'last_name'})
        self.assertNotIn('username', serializer.data)
        self.assertNotIn('email', serializer.data)

class CategorySerializerTests(TestCase):
    def test_serialize_expected_fields(self):
        category = Category.objects.create(
            title = 'Django',
            slug = 'django'
        )

        serializer = CategorySerializer(category)

        self.assertEqual(
            serializer.data,
            {
                'id': category.id,
                'title': 'Django',
                'slug': 'django'
            }
        )

    def test_only_includes_declared_fields(self):
        category = Category.objects.create(
            title = 'Python',
            slug = 'python'
        )

        serializer = CategorySerializer(category)

        self.assertEqual(set(serializer.data.keys()), {'id', 'title', 'slug'})

class CourseListSerializerTests(TestCase):
    def test_serializes_courses_with_nested_categories_and_creator(self):
        teacher = User.objects.create_user(
            username = 'teacher1',
            email = 'teacher@example.com',
            password = 'testpass123',
            first_name = 'Jane',
            last_name = 'Doe'
        )
        category = Category.objects.create(
            title = 'Backend',
            slug = 'backend'
        )
        course = Course.objects.create(
            title = 'Django Basics',
            slug = 'django-basics',
            short_description = 'Learn Django fundamentals',
            status = Course.STATUS_PUBLISHED,
            created_by = teacher,
        )
        course.categories.add(category)

        serializer = CourseListSerializer(course)

        self.assertEqual(
            serializer.data,
            {
                'id': course.id,
                'title': 'Django Basics',
                'slug': 'django-basics',
                'short_description': 'Learn Django fundamentals',
                'categories': [
                    {
                        'id': category.id,
                        'title': 'Backend',
                        'slug': 'backend',
                    }
                ],
                'status': Course.STATUS_PUBLISHED,
                'created_by': {
                    'id': teacher.id,
                    'first_name': 'Jane',
                    'last_name': 'Doe',
                },
            }
        )

class CourseListSerializerManyTests(TestCase):
    def test_serializes_multiple_courses(self):
        teacher = User.objects.create_user(
            username = 'teacher2',
            password = 'testpass123',
            first_name = 'John',
            last_name = 'Smith',
        )
        course_one = Course.objects.create(
            title = 'Course One',
            slug = 'course-one',
            short_description ='First course',
            status = Course.STATUS_DRAFT,
            created_by = teacher,
        )
        course_two = Course.objects.create(
            title = 'Course Two',
            slug = 'course-two',
            short_description = 'Second course',
            status = Course.STATUS_PUBLISHED,
            created_by = teacher,
        )

        serializer = CourseListSerializer([course_one, course_two], many=True)

        self.assertEqual(len(serializer.data), 2)
        self.assertEqual(serializer.data[0]['title'], 'Course One')
        self.assertEqual(serializer.data[1]['title'], 'Course Two')

class CourseDetailSerializerTests(TestCase):
    def test_serilaizer_course_detail_fields(self):
        teacher = User.objects.create_user(
            username = 'teacher1',
            email = 'teacher@example.com',
            password = 'testpass123',
            first_name = 'Jane',
            last_name = 'Doe'
        )
        category = Category.objects.create(
            title = 'Backend',
            slug = 'backend'
        )
        course = Course.objects.create(
            title = 'Django Basics',
            slug = 'django-basics',
            short_description = 'Learn Django fundamentals',
            long_description = 'A longer course description',
            status = Course.STATUS_PUBLISHED,
            created_by = teacher,
        )
        course.categories.add(category)

        serializer = CourseDetailSerializer(course)

        self.assertEqual(
            serializer.data,
            {
                'id': course.id,
                'title': 'Django Basics',
                'slug': 'django-basics',
                'short_description': 'Learn Django fundamentals',
                'long_description': 'A longer course description',
                'created_by': {
                    'id': teacher.id,
                    'first_name': 'Jane',
                    'last_name': 'Doe'
                },
                'status': Course.STATUS_PUBLISHED,
                'categories': [category.id],
            }
        )

class CourseProgressSerializerTests(TestCase):
    def test_serializes_progress_with_course_details(self):
        student = User.objects.create_user(
            username = 'student1',
            password = 'testpass123',
            first_name = 'Alice',
            last_name = 'Brown',
        )
        teacher = User.objects.create_user(
            username = 'teacher1',
            password = 'testpass123',
            first_name = 'Jane',
            last_name = 'Doe',
        )
        category = Category.objects.create(
            title = 'Backend',
            slug = 'backend',
        )
        course = Course.objects.create(
            title = 'Django Basics',
            slug = 'django-basics',
            created_by = teacher,
            status = Course.STATUS_PUBLISHED,
        )
        course.categories.add(category)

        progress = CourseProgress.objects.create(
            user = student,
            course = course,
            status = CourseProgress.STATUS_STARTED,
        )

        progress.mark_started()
        progress.save()

        serializer = CourseProgressSerializer(progress)

        self.assertEqual(serializer.data['id'], progress.id)
        self.assertEqual(serializer.data['course'], course.id)
        self.assertEqual(serializer.data['course_title'], 'Django Basics')
        self.assertEqual(serializer.data['course_slug'], 'django-basics')
        self.assertEqual(
            serializer.data['course_categories'],
            [
                {
                    'id': category.id,
                    'title': 'Backend',
                    'slug': 'backend',
                }
            ]
        )
        self.assertEqual(serializer.data['status'], CourseProgress.STATUS_STARTED)
        self.assertIsNotNone(serializer.data['started_at'])
        self.assertIsNone(serializer.data['completed_at'])

class CourseProgressCreateSerializerTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username = 'student1',
            password = 'testpass123',
        )
        self.teacher = User.objects.create_user(
            username = 'teacher1',
            password = 'testpass123',
        )
        self.course = Course.objects.create(
            title = 'Django Basics',
            slug = 'django-basics',
            created_by = self.teacher,
        )

    def test_valid_data_creates_course_progress(self):
        serializer = CourseProgressCreateSerializer(
            data = {
                'user': self.student.id,
                'course': self.course.id,
                'status': CourseProgress.STATUS_NOT_STARTED,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        progress = serializer.save()

        self.assertEqual(progress.user, self.student)
        self.assertEqual(progress.course, self.course)
        self.assertEqual(progress.status, CourseProgress.STATUS_NOT_STARTED)

    def test_requires_user_and_course(self):
        serializer = CourseProgressCreateSerializer(
            data = {
                'status': CourseProgress.STATUS_NOT_STARTED,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('user', serializer.errors)
        self.assertIn('course', serializer.errors)

class CourseWriteSerializerTests(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username = 'teacher1',
            password = 'testpass123',
        )
        self.category = Category.objects.create(
            title = 'Backend',
            slug = 'backend',
        )

    def test_valid_data_creates_course(self):
        serializer = CourseWriteSerializer(
            data = {
                'title': 'Django Basics',
                'slug': 'django-basics',
                'short_description': 'Learn Django fundamentals',
                'long_description': 'A full introduction to Django.',
                'categories': [self.category.id],
                'status': Course.STATUS_PUBLISHED,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        course = serializer.save(created_by=self.teacher)

        self.assertEqual(course.title, 'Django Basics')
        self.assertEqual(course.slug, 'django-basics')
        self.assertEqual(course.short_description, 'Learn Django fundamentals')
        self.assertEqual(course.long_description, 'A full introduction to Django.')
        self.assertEqual(course.status, Course.STATUS_PUBLISHED)
        self.assertEqual(course.created_by, self.teacher)
        self.assertEqual(list(course.categories.all()), [self.category])

    def test_requires_expected_fields(self):
        serializer = CourseWriteSerializer(
            data = {
                'slug': 'django-basics',
                'status': Course.STATUS_DRAFT,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

    def test_can_update_existing_course(self):
        course = Course.objects.create(
            title='Old Title',
            slug='old-title',
            short_description='Old short description',
            long_description='Old long description',
            status=Course.STATUS_DRAFT,
            created_by=self.teacher,
        )

        serializer = CourseWriteSerializer(
            course,
            data = {
                'title': 'New Title',
                'status': Course.STATUS_PUBLISHED,
                'categories': [self.category.id],
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        updated_course = serializer.save()

        self.assertEqual(updated_course.title, 'New Title')
        self.assertEqual(updated_course.status, Course.STATUS_PUBLISHED)
        self.assertEqual(list(updated_course.categories.all()), [self.category])

class CategoryWriteSerializerTests(TestCase):
    def test_valid_data_creates_category(self):
        serializer = CategoryWriteSerializer(
            data = {
                'title': 'Backend',
                'slug': 'backend',
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        category = serializer.save()

        self.assertEqual(category.title, 'Backend')
        self.assertEqual(category.slug, 'backend')

    def test_requires_title_and_slug(self):
        serializer = CategoryWriteSerializer(data={})

        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
        self.assertIn('slug', serializer.errors)

    def test_can_update_existing_category(self):
        category = Category.objects.create(
            title = 'Old Title',
            slug = 'old-title',
        )

        serializer = CategoryWriteSerializer(
            category,
            data = {
                'title': 'New Title',
                'slug': 'new-title',
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        updated_category = serializer.save()

        self.assertEqual(updated_category.title, 'New Title')
        self.assertEqual(updated_category.slug, 'new-title')

class StudentCourseProgessSerializerTests(TestCase):
    def test_serializes_student_with_course_progress(self):
        student = User.objects.create_user(
            username = 'student1',
            email = 'student@example.com',
            password = 'testpass123',
            first_name = 'Alice',
            last_name = 'Brown',
        )
        teacher = User.objects.create_user(
            username = 'teacher1',
            password = 'testpass123',
            first_name = 'Jane',
            last_name = 'Doe',
        )
        category = Category.objects.create(
            title = 'Backend',
            slug = 'backend',
        )
        course = Course.objects.create(
            title = 'Django Basics',
            slug = 'django-basics',
            created_by = teacher,
            status = Course.STATUS_PUBLISHED,
        )
        course.categories.add(category)

        progress = CourseProgress.objects.create(
            user = student,
            course = course,
            status = CourseProgress.STATUS_STARTED,
        )
        progress.mark_started()
        progress.save()

        serializer = StudentCourseProgessSerializer(student)

        self.assertEqual(
            serializer.data,
            {
                'id': student.id,
                'first_name': 'Alice',
                'last_name': 'Brown',
                'email': 'student@example.com',
                'courses_progress': [
                    {
                        'id': progress.id,
                        'course': course.id,
                        'course_title': 'Django Basics',
                        'course_slug': 'django-basics',
                        'course_categories': [
                            {
                                'id': category.id,
                                'title': 'Backend',
                                'slug': 'backend',
                            }
                        ],
                        'status': CourseProgress.STATUS_STARTED,
                        'started_at': serializer.data['courses_progress'][0]['started_at'],
                        'completed_at': None,
                    }
                ],
            }
        )

    def test_serializes_student_with_no_progress(self):
        student = User.objects.create_user(
            username = 'student2',
            email = 'student2@example.com',
            password = 'testpass123',
            first_name = 'Bob',
            last_name = 'Smith',
        )

        serializer = StudentCourseProgessSerializer(student)

        self.assertEqual(
            serializer.data,
            {
                'id': student.id,
                'first_name': 'Bob',
                'last_name': 'Smith',
                'email': 'student2@example.com',
                'courses_progress': [],
            }
        )