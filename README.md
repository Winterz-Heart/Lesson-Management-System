# Lesson Management System

A full-stack lesson and course management app built with Django REST Framework and Vue.

## Overview

This project provides a learning platform where users can browse courses, track progress, and manage course content based on their role.

The system includes:

- A Django backend for authentication, course management, user roles, and progress tracking
- A Vue frontend for the user interface
- Token-based auth using Djoser
- SQLite for local development



## Features
- Homepage with course previews
![Homepage Screenshot](<README screenshots/Homepage Screenshot.png>)
- User registration and login
![SignUp Screenshot](<README screenshots/SignUp Screenshot.png>)
![Login Screenshot](<README screenshots/Login Screenshot.png>)
- Role-based access for students, teachers, and admins
![AdminRoleAdjustment Screenshot](<README screenshots/AdminRoleAdjustment Screenshot.png>)
- Course categories and course listings
![Courses Screenshot](<README screenshots/Courses Screenshot.png>)
- Draft and published course workflows
![CourseCreator Screenshot](<README screenshots/CourseCreator Screenshot.png>)
- Course progress tracking
![StudentTracker Screenshot](<README screenshots/StudentTracker Screenshot.png>)
- Teacher course creation and editing
![CourseEditor Screenshot](<README screenshots/CourseEditor Screenshot.png>)
- Admin user and progress management
![AdminCourses Screenshot](<README screenshots/AdminCourses Screenshot.png>)

## API Routes

### Authentication
Djoser auth endpoints are available under:

```
/api/v1/
```

Examples include:

- ```/api/v1/users/```
- ```/api/v1/token/login/```
- ```/api/v1/token/logout/```
- ```/api/v1/users/me/```

### Courses
Course-related endpoints are available under:

```
/api/v1/courses/
```

Examples include:

- ```/api/v1/courses/```
- ```/api/v1/courses/get_categories/```
- ```/api/v1/courses/get_frontpage_courses/```
- ```/api/v1/courses/my_progress/```
- ```/api/v1/courses/teacher/create/```

### Roles
The application supports three user roles:

- Student
- Teacher
- Admin
These roles control access to course creation, publication, and management features.

## Technolgies Used

### Backend
- Python
- Django
- Django REST Framework
- Djoser
- django-cors-headers
- SQLite

### Frontend
- Vue 3
- Vue Router
- Vuex
- Axios
- Bulma

### Testing
- Django test runner
- Vitest
- @vue/test-utils

## Project Structure

```text
Lesson Management System/
├── env/                # Python virtual environment
├── lms_django/         # Django backend
│   ├── manage.py
│   ├── db.sqlite3
│   ├── courses/
│   └── lms_django/
├── lms_vue/            # Vue frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── README screenshots/
└── README.md
```

### Wireframes

Here are the initial wirframes that I mocked up

![Initial Wireframes](<README screenshots/Initial Wireframes Used.png>)


### Prerequisites
To run the Lesson Management System locally, ensure you have the following installed:

- Python 3.14+
- Node.js with npm

#### Backend Requirements
- Python virtual environment support
- Django and related Python packages installed from the project environment

#### Frontend Requirements
- npm package manager
- Vue CLI dependencies installed through npm install

#### Development Environment
- SQLite support for local database usage
- Port 8000 available for the Django backend
- Port 8080 available for the Vue frontend

### Installation

1. Clone the repoistory
```bash
git clone https://github.com/Winterz-Heart/Lesson-Management-System

cd Lesson-Management-System
```
2. Set up the Backend and Virtual Enviroment
```bash
cd lms_django
python -m venv env

env\Scripts\activate

pip install django djangorestframework django-cors-headers djoser

python manage.py migrate
```
3. Set up the Frontend
```bash
cd lms_vue
npm install
```
4. Run the Development servers

Django Backend
```bash
cd lms_django
python manage.py runserver
```

Vue Frontend
```
cd lms_vue
npm run serve
```
5. Access the application

- Backend: http://127.0.0.1:8000/
- Frontend: http://localhost:8080/

## Future plans

- Add lessons to courses
- Change course progress to percent or out of format
- Automate course progress so its tied to lesson completion
