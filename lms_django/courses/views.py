from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .serializers import CategorySerializer, CourseListSerializer, CourseDetailSerializer, UserSerializer, CourseProgressSerializer
from .models import Category, Course, CourseProgress

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_courses(request):
    courses = Course.objects.all().prefetch_related('categories')

    category_id = request.GET.get('category_id')
    if category_id:
        courses = courses.filter(categories__id=category_id)

    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_course_details(request, slug):
    course = Course.objects.all().get(slug=slug)
    serializer = CourseDetailSerializer(course)
    return Response(serializer.data)

@api_view(['GET'])
def get_frontpage_courses(request):
    courses = Course.objects.all()[0:4]
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_author_courses(request, user_id):
    user = User.objects.get(pk = user_id)
    courses = user.courses.all()

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