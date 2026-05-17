from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .serializers import CatergorySerializer, CourseListSerializer, CourseDetailSerializer
from .models import Catergory, Course

@api_view(['GET'])
def get_catergories(request):
    categories = Catergory.objects.all()
    serializer = CatergorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_courses(request):
    courses = Course.objects.all()
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)