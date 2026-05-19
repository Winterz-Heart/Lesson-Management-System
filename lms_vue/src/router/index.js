import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'

import MyAccount from '../views/dashboard/MyAccount.vue'
import AccountGeneral from '../views/dashboard/AccountGeneral.vue'
import AccountStarted from '../views/dashboard/AccountStarted.vue'
import AccountCompleted from '../views/dashboard/AccountCompleted.vue'
import AccountDraftCourses from '../views/dashboard/AccountDraftCourses.vue'
import AccountPublishedCourses from '../views/dashboard/AccountPublishedCourses.vue'
import CourseCreator from '../views/dashboard/CourseCreator.vue'
import CourseEditor from '../views/dashboard/CourseEditor.vue'

import Courses from '../views/Courses.vue'
import TeacherCourses from '../views/TeacherCourses.vue'
import Course from '../views/Course.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: SignUp
  },
  {
    path: '/courses',
    name: 'courses',
    component: Courses
  },
  {
    path: '/courses/:slug',
    name: 'course',
    component: Course
  },
  {
    path: '/teachers/:user_id',
    name: 'teacher-courses',
    component: TeacherCourses
  },
  {
    path: '/dashboard/my-account',
    name: 'my-account',
    component: MyAccount,
    children: [
      {
        path: '',
        name: 'my-account-general',
        component: AccountGeneral
      },
      {
        path: 'started',
        name: 'my-account-started',
        component: AccountStarted
      },
      {
        path: 'completed',
        name: 'my-account-completed',
        component: AccountCompleted
      },
      {
        path: 'drafts',
        name: 'my-account-drafts',
        component: AccountDraftCourses
      },
      {
        path: 'published',
        name: 'my-account-published',
        component: AccountPublishedCourses
      },
      {
        path: 'course-create',
        name: 'my-account-course-create',
        component: CourseCreator
      },
      {
        path: 'course-edit',
        name: 'my-account-course-edit',
        component: CourseEditor
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
