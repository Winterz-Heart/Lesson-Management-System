import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

const mockStore = vi.hoisted(() => ({
  state: {
    user: {
      token: '',
      isAuthenticated: false,
      id: null,
      role: 'user',
      groups: []
    }
  },
  dispatch: vi.fn()
}))

vi.mock('../../store', () => ({
  default: mockStore
}))

vi.mock('../../views/Home.vue', () => ({ default: { template: '<div>Home</div>' } }))
vi.mock('../../views/About.vue', () => ({ default: { template: '<div>About</div>' } }))
vi.mock('../../views/Login.vue', () => ({ default: { template: '<div>Login</div>' } }))
vi.mock('../../views/SignUp.vue', () => ({ default: { template: '<div>SignUp</div>' } }))
vi.mock('../../views/Courses.vue', () => ({ default: { template: '<div>Courses</div>' } }))
vi.mock('../../views/TeacherCourses.vue', () => ({ default: { template: '<div>TeacherCourses</div>' } }))
vi.mock('../../views/Course.vue', () => ({ default: { template: '<div>Course</div>' } }))

vi.mock('../../views/dashboard/MyAccount.vue', () => ({ default: { template: '<router-view />' } }))
vi.mock('../../views/dashboard/AccountGeneral.vue', () => ({ default: { template: '<div>AccountGeneral</div>' } }))
vi.mock('../../views/dashboard/AccountStarted.vue', () => ({ default: { template: '<div>AccountStarted</div>' } }))
vi.mock('../../views/dashboard/AccountCompleted.vue', () => ({ default: { template: '<div>AccountCompleted</div>' } }))
vi.mock('../../views/dashboard/StudentTracker.vue', () => ({ default: { template: '<div>StudentTracker</div>' } }))
vi.mock('../../views/dashboard/AccountDraftCourses.vue', () => ({ default: { template: '<div>AccountDraftCourses</div>' } }))
vi.mock('../../views/dashboard/AccountPublishedCourses.vue', () => ({ default: { template: '<div>AccountPublishedCourses</div>' } }))
vi.mock('../../views/dashboard/CourseCreator.vue', () => ({ default: { template: '<div>CourseCreator</div>' } }))
vi.mock('../../views/dashboard/CourseEditor.vue', () => ({ default: { template: '<div>CourseEditor</div>' } }))

vi.mock('../../views/dashboard/admin/AdminDraftCourses.vue', () => ({ default: { template: '<div>AdminDraftCourses</div>' } }))
vi.mock('../../views/dashboard/admin/AdminPublishedCourses.vue', () => ({ default: { template: '<div>AdminPublishedCourses</div>' } }))
vi.mock('../../views/dashboard/admin/AdminStudentTracker.vue', () => ({ default: { template: '<div>AdminStudentTracker</div>' } }))
vi.mock('../../views/dashboard/admin/AdminRoleAdjustor.vue', () => ({ default: { template: '<div>AdminRoleAdjustor</div>' } }))
vi.mock('../../views/dashboard/admin/AdminCoursesTable.vue', () => ({ default: { template: '<div>AdminCoursesTable</div>' } }))

import router from '../index'

function setUser({ isAuthenticated = false, id = null, role = 'user' } = {}) {
    mockStore.state.user.token = isAuthenticated ? 'test-token' : ''
    mockStore.state.user.isAuthenticated = isAuthenticated
    mockStore.state.user.id = id
    mockStore.state.user.role = role
}

async function navigateTo(target) {
    await router.push(target).catch(() => {})
    await flushPromises()
    }

describe('router protection', () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        window.alert = vi.fn()
        setUser()

        if (router.currentRoute.value.fullPath !== '/') {
            await navigateTo('/')
        }
    })

    it('allows public routes', async () => {
        await navigateTo('/about')

        expect(router.currentRoute.value.name).toBe('about')
        expect(window.alert).not.toHaveBeenCalled()
    })

    it('redirects unauthenticated users away from protected routes', async () => {
        await navigateTo('/dashboard/my-account')

        expect(router.currentRoute.value.name).toBe('login')
        expect(window.alert).toHaveBeenCalledWith('Please log in to continue')
    })

    it('redirects users without the right role', async () => {
        setUser({ isAuthenticated: true, id: 10, role: 'Student' })

        await navigateTo('/dashboard/admin/drafts')

        expect(router.currentRoute.value.name).toBe('my-account-general')
        expect(window.alert).toHaveBeenCalledWith('You do not have permission to view this page')
    })
})