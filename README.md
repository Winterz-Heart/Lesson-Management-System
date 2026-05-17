# Lesson Management System

## Getting Started

## Technolgies Used
- Django (Python)
- Django Rest-Framework
- Django Cors-Headers
- Djoser
- Vue.js
- Bulma CSS Framework
- Vitest
- @vue/test-utils
- @vitejs/plugin-vue
- happy-dom

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
