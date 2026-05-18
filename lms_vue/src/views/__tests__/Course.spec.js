import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import Course from "../Course.vue";

vi.mock('axios', () => ({
    default: {
        get: vi.fn()
    }
}))

describe('Course.vue', () => {
    const mockCourse = {
        title: 'Vue Basics',
        long_description: 'Learn the fundamentals of Vue step by step.',
        created_by: {
            id: 1,
            first_name: 'John',
            last_name: 'Doe'
        }
    }

    beforeEach(() => {
        document.title = ''
        vi.clearAllMocks()
        axios.get.mockResolvedValue({ data: mockCourse })
    })

    function mountCourse(isAuthenticated = true) {
        return mount(Course, {
            global: {
                mocks: {
                    $route: {
                        params: {
                            slug: 'vue-basics'
                        }
                    },
                    $store: {
                        state: {
                            user: { isAuthenticated }
                        }
                    }
                },
                stubs: {
                    RouterLink: {
                        template: '<a><slot /></a>'
                    }
                }
            }
        })
    }

    it('renders the course title', async () => {
        const wrapper = mountCourse()
        await  flushPromises()

        expect(wrapper.text()).toContain('Vue Basics')
    })

    it('sets the document title on mount', async () => {
        mountCourse()
        await  flushPromises()

        expect(document.title).toBe('Vue Basics | LMS')
    })

    it('fetches the courses on mount', async () => {
        mountCourse()
        await  flushPromises()

        expect(axios.get).toHaveBeenCalledWith('api/v1/courses/vue-basics/')
        expect(axios.get).toHaveBeenCalledTimes(1)
    })

    it('renders the author name', async () => {
        const wrapper = mountCourse()
        await  flushPromises()

        expect(wrapper.text()).toContain('By John Doe')
    })

    it('shows the course description when authenticated', async () => {
        const wrapper = mountCourse()
        await  flushPromises()

        expect(wrapper.text()).toContain('Introduction')
        expect(wrapper.text()).toContain('Learn the fundamentals of Vue step by step.')
    })

    it('shows restricted access when not  authenticated', async () => {
        const wrapper = mountCourse(false)
        await  flushPromises()

        expect(wrapper.text()).toContain('Restricted access')
        expect(wrapper.text()).toContain('You need to sign in to view courses')
        expect(wrapper.text()).not.toContain('Learn the fundamentals of Vue step by step.')
    })
})