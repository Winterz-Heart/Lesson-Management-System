import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'

import MyAccount from '../views/dashboard/myAccount.vue'

import Courses from '../views/Courses.vue'
import AuthorCourses from '../views/AuthorCourses.vue'
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
    path: '/authors/:user_id',
    name: 'author-courses',
    component: AuthorCourses
  },
  {
    path: '/dashboard/my-account',
    name: 'my-account',
    component: MyAccount
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
