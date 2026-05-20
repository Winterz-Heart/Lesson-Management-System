from django.urls import path

from courses import views

urlpatterns = [
    path('', views.get_courses),
    path('get_categories/', views.get_categories),
    path('get_frontpage_courses/', views.get_frontpage_courses),
    path('get_teacher_courses/<int:user_id>/', views.get_teacher_courses),

    path('my_progress/', views.get_my_progress),
    path('<int:course_id>/start/', views.start_course),
    path('<int:course_id>/complete/', views.complete_course),
    path('<int:course_id>/course_progress/', views.get_course_progress),

    path('teacher/create/', views.teacher_create_course),
    path('teacher/my_drafts/', views.get_my_draft_courses),
    path('teacher/my_published/', views.get_my_published_courses),
    path('teacher/<int:course_id>/edit/', views.teacher_edit_course),
    path('teacher/student-progress-table/', views.get_student_progress_table),

    path('admin/drafts/', views.get_admin_draft_courses),
    path('admin/published/', views.get_admin_published_courses),
    path('admin/student-progress/create/', views.admin_assign_student_to_course),
    path('admin/student-progress/update/<int:progress_id>/', views.admin_update_progress),
    path('admin/student-progress/delete/<int:progress_id>/', views.admin_remove_student_from_course),

    path('<slug:slug>/', views.get_course_details),
]

