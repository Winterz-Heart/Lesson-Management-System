from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .serializers import CategorySerializer, CourseListSerializer, CourseDetailSerializer
from .models import Category, Course

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_courses(request):
    courses = Course.objects.all()

    category_id = request.GET.get('category_id')
    if category_id:
        courses = courses.filter(categories__id=category_id)

    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_frontpage_courses(request):
    courses = Course.objects.all()[0:4]
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)