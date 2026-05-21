import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'

import MyAccount from '../views/dashboard/MyAccount.vue'
import AccountGeneral from '../views/dashboard/AccountGeneral.vue'
import AccountStarted from '../views/dashboard/AccountStarted.vue'
import AccountCompleted from '../views/dashboard/AccountCompleted.vue'
import StudentTracker from '../views/dashboard/StudentTracker.vue'
import AccountDraftCourses from '../views/dashboard/AccountDraftCourses.vue'
import AccountPublishedCourses from '../views/dashboard/AccountPublishedCourses.vue'
import CourseCreator from '../views/dashboard/CourseCreator.vue'
import CourseEditor from '../views/dashboard/CourseEditor.vue'

import AdminDraftCourses from '../views/dashboard/admin/AdminDraftCourses.vue'
import AdminPublishedCourses from '../views/dashboard/admin/AdminPublishedCourses.vue'
import AdminStudentTracker from '../views/dashboard/admin/AdminStudentTracker.vue'
import AdminRoleAdjustor from '../views/dashboard/admin/AdminRoleAdjustor.vue'
import AdminCoursesTable from '../views/dashboard/admin/AdminCoursesTable.vue'

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
    path: '/dashboard',
    name: 'my-account',
    component: MyAccount,
    children: [
      {
        path: 'my-account',
        name: 'my-account-general',
        component: AccountGeneral
      },
      {
        path: 'my-account/started',
        name: 'my-account-started',
        component: AccountStarted
      },
      {
        path: 'my-account/completed',
        name: 'my-account-completed',
        component: AccountCompleted
      },
      {
        path: 'my-account/student-tracker',
        name: 'my-account-student-tracker',
        component: StudentTracker
      },
      {
        path: 'my-account/drafts',
        name: 'my-account-drafts',
        component: AccountDraftCourses
      },
      {
        path: 'my-account/published',
        name: 'my-account-published',
        component: AccountPublishedCourses
      },
      {
        path: 'my-account/course-create',
        name: 'my-account-course-create',
        component: CourseCreator
      },
      {
        path: 'my-account/course-edit/:slug',
        name: 'my-account-course-edit',
        component: CourseEditor
      },
      {
        path: 'admin/drafts',
        name: 'admin-drafts',
        component: AdminDraftCourses
      },
      {
        path: 'admin/published',
        name: 'admin-published',
        component: AdminPublishedCourses
      },
      {
        path: 'admin/student-tracker',
        name: 'admin-student-tracker',
        component: AdminStudentTracker
      },
      {
        path: 'admin/courses-table',
        name: 'admin-courses-table',
        component: AdminCoursesTable
      },
      {
        path: 'admin/role-adjustor',
        name: 'admin-role-adjustor',
        component: AdminRoleAdjustor
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
