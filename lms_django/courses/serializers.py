from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Category, Course

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'title', 'slug')

class CourseListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True)

    class Meta:
        model = Course
        fields = ('id', 'title', 'slug', 'short_description', 'categories')

class CourseDetailSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(many=False)
    class Meta:
        model = Course
        fields = ('id', 'title', 'slug', 'short_description', 'long_description', 'created_by')