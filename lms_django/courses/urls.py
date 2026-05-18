from django.urls import path

from courses import views

urlpatterns = [
    path('', views.get_courses),
    path('get_categories/', views.get_categories),
    path('get_frontpage_courses/', views.get_frontpage_courses),
    path('<slug:slug>/', views.get_course_details),
]

