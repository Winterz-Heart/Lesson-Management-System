from django.urls import path

from courses import views

urlpatterns = [
    path('', views.get_courses),
    path('get_catergories/', views.get_catergories),
]

