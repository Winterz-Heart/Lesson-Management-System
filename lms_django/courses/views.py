from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .serializers import CategorySerializer, CourseListSerializer, CourseDetailSerializer, UserSerializer
from .models import Category, Course

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