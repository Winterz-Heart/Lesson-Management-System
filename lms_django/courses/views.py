from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    UserSerializer,
    CourseProgressSerializer,
    CourseProgressCreateSerializer,
    CourseWriteSerializer,
    StudentCourseProgessSerializer
    )
from .permissions import IsTeacherOrAdmin, IsAdmin
from .models import Category, Course, CourseProgress

def _get_user_role(user):
    if not user.is_authenticated:
        return None
    
    profile = getattr(user, 'profile', None)
    return getattr(profile, 'role', None)

def _is_admin(user):
    return user.is_authenticated and (user.is_staff or _get_user_role(user) == 'admin')

def _can_view_draft_course(request, course):
    if _is_admin(request.user):
        return True
    
    return (
        request.user.is_authenticated and
        _get_user_role(request.user) == 'teacher' and
        course.created_by_id == request.user.id
    )

def _visible_courses_queryset(request):
    courses = Course.objects.all().prefetch_related('categories')

    if _is_admin(request.user):
        return courses
    
    if request.user.is_authenticated and _get_user_role(request.user) == 'teacher':
        return courses.filter(Q(status=Course.STATUS_PUBLISHED) | Q(created_by=request.user))
    
    return courses.filter(status=Course.STATUS_PUBLISHED)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_courses(request):
    courses = _visible_courses_queryset(request)

    category_id = request.GET.get('category_id')
    status = request.GET.get('status')

    if category_id:
        courses = courses.filter(categories__id=category_id)

    if status:
        courses = courses.filter(status=status)

    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_course_details(request, slug):
    course = Course.objects.select_related('created_by').prefetch_related('categories').get(slug=slug)

    if course.status == Course.STATUS_DRAFT and not _can_view_draft_course(request, course):
        return Response({'detail': 'You do not have permission to view this course'})

    serializer = CourseDetailSerializer(course)
    return Response(serializer.data)

@api_view(['GET'])
def get_frontpage_courses(request):
    courses = _visible_courses_queryset(request)[0:4]
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_teacher_courses(request, user_id):
    user = User.objects.get(pk = user_id)
    
    if _is_admin(request.user):
        courses = user.courses.all().prefetch_related('categories')
    elif request.user.is_authenticated and request.user.id == user_id and _get_user_role(request.user) == 'teacher':
        courses = user.courses.all().prefetch_related('categories')
    else:
        courses = user.courses.filter(status=Course.STATUS_PUBLISHED).prefecth_related('categories')

    user_serializer = UserSerializer(user, many=False)
    courses_serializer = CourseListSerializer(courses, many=True)

    return Response({
        'courses': courses_serializer.data,
        'created_by': user_serializer.data,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_course(request, course_id):
    course = Course.objects.filter(id=course_id).first()
    progress, _ = CourseProgress.objects.get_or_create(
        user=request.user,
        course=course
    )

    progress.mark_started()
    progress.save()

    serializer = CourseProgressSerializer(progress)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_course(request, course_id):
    course = Course.objects.filter(id=course_id).first()
    progress, _ = CourseProgress.objects.get_or_create(
        user=request.user,
        course=course
    )

    progress.mark_completed()
    progress.save()

    serializer = CourseProgressSerializer(progress)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_progress(request):
    progress = CourseProgress.objects.filter(user=request.user)

    serializer = CourseProgressSerializer(progress, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_progress(request, course_id):
    progress = CourseProgress.objects.filter(user=request.user, course_id=course_id).first()

    if progress is None:
        return Response({'course': course_id, 'status': 'not_started', 'started_at': None, 'completed_at': None})

    serializer = CourseProgressSerializer(progress, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTeacherOrAdmin])
def teacher_create_course(request):
    serializer = CourseWriteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data)
    return Response(serializer.errors)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsTeacherOrAdmin])
def teacher_edit_course(request, course_id):
    course = Course.objects.filter(id=course_id).first()
    if course is None:
        return Response({ 'detail': 'Not Found' })
    
    if not _is_admin(request.user) and course.created_by_id != request.user.id:
        return Response({'detail': 'You do not have permission to edit this course'})
    
    serializer = CourseWriteSerializer(course, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return  Response(serializer.errors)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTeacherOrAdmin])
def get_my_draft_courses(request):
    courses = Course.objects.filter(
        created_by = request.user,
        status=Course.STATUS_DRAFT
    ).prefetch_related('categories')

    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTeacherOrAdmin])
def get_my_published_courses(request):
    courses = Course.objects.filter(
        created_by = request.user,
        status=Course.STATUS_PUBLISHED
    ).prefetch_related('categories')

    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_admin_draft_courses(request):
    courses = Course.objects.filter(
        status=Course.STATUS_DRAFT
    ).prefetch_related('categories')

    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_admin_published_courses(request):
    courses = Course.objects.filter(
        status=Course.STATUS_PUBLISHED
    ).prefetch_related('categories')

    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTeacherOrAdmin])
def get_student_progress_table(request):
    users = User.objects.filter(profile__role='student').prefetch_related(
        'courses_progress__course__categories'
    )
    serializer = StudentCourseProgessSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_assign_student_to_course(request):
    serializer = CourseProgressCreateSerializer(data=request.data)
    if serializer.is_valid():
        progress = serializer.save()
        progress.mark_started()
        progress.save()
        return Response(CourseProgressSerializer(progress).data)
    return Response(serializer.errors)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_update_progress(request, progress_id):
    progress  = CourseProgress.objects.filter(id=progress_id).first()
    serializer = CourseProgressSerializer(progress, data=request.data, partial=True)
    if progress is None:
        return Response({'detail': 'Not found.'})

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_remove_student_from_course(request, progress_id):
    progress = CourseProgress.objects.filter(id=progress_id).first()
    if progress is None:
        return Response({'detail': 'Not found.'})
    
    progress.delete()
    return Response()

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsTeacherOrAdmin])
def teacher_delete_course(request, course_id):
    course = Course.objects.filter(id=course_id)

    if not _is_admin(request.user) and course.created_by_id != request.user.id:
        return Response({'detail': 'You do not have permission to delete this course'})
    
    course.delete()
    return Response()

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_all_users_with_roles(request):
    users = User.objects.select_related('profile').all()
    data = [
        {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.username,
            'role': user.profile.role
        }
        for user in users
    ]

    return Response(data)