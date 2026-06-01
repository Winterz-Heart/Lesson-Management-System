import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import store from '../store'
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
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'my-account',
        name: 'my-account-general',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Student', 'Teacher', 'Admin']
        },
        component: AccountGeneral
      },
      {
        path: 'my-account/started',
        name: 'my-account-started',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Student']
        },
        component: AccountStarted
      },
      {
        path: 'my-account/completed',
        name: 'my-account-completed',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Student']
        },
        component: AccountCompleted
      },
      {
        path: 'my-account/student-tracker',
        name: 'my-account-student-tracker',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Teacher', 'Admin']
        },
        component: StudentTracker
      },
      {
        path: 'my-account/drafts',
        name: 'my-account-drafts',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Teacher', 'Admin']
        },
        component: AccountDraftCourses
      },
      {
        path: 'my-account/published',
        name: 'my-account-published',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Teacher', 'Admin']
        },
        component: AccountPublishedCourses
      },
      {
        path: 'my-account/course-create',
        name: 'my-account-course-create',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Teacher', 'Admin']
        },
        component: CourseCreator
      },
      {
        path: 'my-account/course-edit/:slug',
        name: 'my-account-course-edit',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Teacher', 'Admin']
        },
        beforeEnter: (to, from, next) => {
          const userRole = store.state.user.role

          if (userRole === 'Admin') {
            next()
            return
          }

          const ensureUserLoaded = store.state.user.id
            ? Promise.resolve()
            : store.dispatch('fetchCurrentUser')

          ensureUserLoaded
            .then(() => {
              return axios.get(`/api/v1/courses/${to.params.slug}`)
            })
            .then(response => {
              const course = response.data

              if (course.created_by && course.created_by.id === store.state.user.id) {
                next()
                return
              }

              window.alert('You can only edit your own courses')
              next({ name: 'my-account-drafts' })
            })
            .catch(() => {
              window.alert('Unable to load that course')
              next({ name: 'my-account-drafts' })
            })
        },
        component: CourseEditor
      },
      {
        path: 'admin/drafts',
        name: 'admin-drafts',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Admin']
        },
        component: AdminDraftCourses
      },
      {
        path: 'admin/published',
        name: 'admin-published',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Admin']
        },
        component: AdminPublishedCourses
      },
      {
        path: 'admin/student-tracker',
        name: 'admin-student-tracker',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Admin']
        },
        component: AdminStudentTracker
      },
      {
        path: 'admin/courses-table',
        name: 'admin-courses-table',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Admin']
        },
        component: AdminCoursesTable
      },
      {
        path: 'admin/role-adjustor',
        name: 'admin-role-adjustor',
        meta: {
          requiresAuth: true,
          allowedRoles: ['Admin']
        },
        component: AdminRoleAdjustor
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const needsAuth = to.matched.some(route => route.meta.requiresAuth)

  if (!needsAuth) {
    next()
    return
  }

  const isAuthenticated = store.state.user.isAuthenticated

  if (!isAuthenticated) {
    window.alert('Please log in to continue')
    next({ name: 'login' })
    return
  }

  const ensureUserLoaded = store.state.user.id
    ? Promise.resolve()
    : store.dispatch('fetchCurrentUser')

  ensureUserLoaded
    .then(() => {
      const userRole = store.state.user.role

      if (
        (userRole === 'Teacher' || userRole === 'Admin') &&
        ( to.name === 'my-account-started' || to.name === 'my-account-completed' )
      ) {
        window.alert('Only students can view student progress pages. You have been redirected to the Student Tracker.')
        next({ name: 'my-account-student-tracker' })
        return
      }

      const blockedByRole = to.matched.some(route => {
        const allowedRoles = route.meta.allowedRoles
        return allowedRoles && !allowedRoles.includes(userRole)
      })

      if (blockedByRole) {
        window.alert('You do not have permission to view this page')
        next({ name: 'my-account-general' })
        return
      }

      next()
    })
    .catch(() => {
      window.alert('Please log in to continue')
      next({ name: 'login' })
    })
})

export default router
