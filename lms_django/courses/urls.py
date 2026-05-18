from django.urls import path

from courses import views

urlpatterns = [
    path('', views.get_courses),
    path('get_categories/', views.get_categories),
    path('get_frontpage_courses/', views.get_frontpage_courses),
    path('get_author_courses/<int:user_id>/', views.get_author_courses),

    path('<int:course_id>/start/', views.start_course),
    path('<int:course_id>/complete/', views.complete_course),
    path('my_progress/', views.get_my_progress),
    path('course_progress/', views.get_course_progress),

    path('<slug:slug>/', views.get_course_details),
]

